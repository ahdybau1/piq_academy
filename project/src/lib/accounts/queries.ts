import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { AuditLogEntry } from '@/lib/academic/types';
import type { AccountListItem, AccountDetail, ProfileRow, TransactionRow, EnrichedProfile } from './types';

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Profils ayant au moins une subscription ou une transaction liée : ces profils ne
 * peuvent pas être supprimés physiquement (traçabilité comptable/litige) — voir
 * anonymizeAccount / deleteOrAnonymizeProfile dans mutations.ts.
 */
export async function getProfileIdsWithFinancialHistory(
  supabase: SupabaseServerClient,
  profileIds: string[]
): Promise<Set<string>> {
  if (profileIds.length === 0) return new Set();

  const [{ data: subs, error: subsError }, { data: txs, error: txsError }] = await Promise.all([
    supabase.from('subscriptions').select('profile_id').in('profile_id', profileIds),
    supabase.from('transactions').select('profile_id').in('profile_id', profileIds),
  ]);
  if (subsError) throw new Error(subsError.message);
  if (txsError) throw new Error(txsError.message);

  return new Set([...(subs ?? []).map((s) => s.profile_id), ...(txs ?? []).map((t) => t.profile_id)]);
}

/** Résout les noms de classe et de pays d'un ensemble de class_node_id, sans supposer de FK PostgREST. */
async function fetchClassNames(
  supabase: SupabaseServerClient,
  classNodeIds: string[]
): Promise<Map<string, { name: string; countryName: string | null }>> {
  if (classNodeIds.length === 0) return new Map();

  const { data: nodes, error } = await supabase
    .from('academic_nodes')
    .select('id, name, country_id')
    .in('id', classNodeIds);
  if (error) throw new Error(error.message);

  const countryIds = Array.from(
    new Set((nodes ?? []).map((n) => n.country_id).filter((v): v is string => !!v))
  );

  let countryNames = new Map<string, string>();
  if (countryIds.length > 0) {
    const { data: countries, error: countryError } = await supabase
      .from('academic_nodes')
      .select('id, name')
      .in('id', countryIds);
    if (countryError) throw new Error(countryError.message);
    countryNames = new Map((countries ?? []).map((c) => [c.id, c.name]));
  }

  return new Map(
    (nodes ?? []).map((n) => [
      n.id,
      { name: n.name, countryName: n.country_id ? countryNames.get(n.country_id) ?? null : null },
    ])
  );
}

function enrichProfiles(
  profiles: ProfileRow[],
  classNames: Map<string, { name: string; countryName: string | null }>
): EnrichedProfile[] {
  return profiles.map((p) => ({
    ...p,
    className: p.class_node_id ? classNames.get(p.class_node_id)?.name ?? null : null,
    countryName: p.class_node_id ? classNames.get(p.class_node_id)?.countryName ?? null : null,
  }));
}

export async function listAccounts(): Promise<AccountListItem[]> {
  const supabase = await createClient();

  const [{ data: accounts, error: accountsError }, { data: profiles, error: profilesError }] = await Promise.all([
    supabase
      .from('accounts')
      .select('id, email, first_name, last_name, phone, status, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, account_id, class_node_id, status, subscription_tier, school_year'),
  ]);
  if (accountsError) throw new Error(accountsError.message);
  if (profilesError) throw new Error(profilesError.message);

  const classNames = await fetchClassNames(
    supabase,
    Array.from(new Set((profiles ?? []).map((p) => p.class_node_id).filter((v): v is string => !!v)))
  );

  const profilesByAccount = new Map<string, ProfileRow[]>();
  (profiles ?? []).forEach((p) => {
    profilesByAccount.set(p.account_id, [...(profilesByAccount.get(p.account_id) ?? []), p]);
  });

  return (accounts ?? []).map((account) => ({
    ...account,
    profiles: enrichProfiles(profilesByAccount.get(account.id) ?? [], classNames),
  }));
}

export async function getAccountDetail(
  id: string,
  options: { includeFinancials: boolean }
): Promise<AccountDetail | null> {
  const supabase = await createClient();

  const { data: account, error } = await supabase
    .from('accounts')
    .select('id, email, first_name, last_name, phone, status, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!account) return null;

  const [{ data: profiles, error: profilesError }, { data: sessions, error: sessionsError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, account_id, class_node_id, status, subscription_tier, school_year')
      .eq('account_id', id),
    supabase
      .from('sessions')
      .select('id, account_id, device_fingerprint, platform, created_at, is_active')
      .eq('account_id', id)
      .order('created_at', { ascending: false }),
  ]);
  if (profilesError) throw new Error(profilesError.message);
  if (sessionsError) throw new Error(sessionsError.message);

  const classNames = await fetchClassNames(
    supabase,
    (profiles ?? []).map((p) => p.class_node_id).filter((v): v is string => !!v)
  );
  const enrichedProfiles = enrichProfiles(profiles ?? [], classNames);

  const profileIds = enrichedProfiles.map((p) => p.id);

  let transactions: TransactionRow[] = [];
  if (options.includeFinancials && profileIds.length > 0) {
    const { data: txs, error: txError } = await supabase
      .from('transactions')
      .select('id, profile_id, amount, operator, status, aggregator_ref, created_at')
      .in('profile_id', profileIds)
      .order('created_at', { ascending: false });
    if (txError) throw new Error(txError.message);
    transactions = txs ?? [];
  }

  const idsWithHistory = await getProfileIdsWithFinancialHistory(supabase, profileIds);
  const profilesWithHistoryFlag = enrichedProfiles.map((p) => ({
    ...p,
    hasFinancialHistory: idsWithHistory.has(p.id),
  }));

  return {
    ...account,
    profiles: profilesWithHistoryFlag,
    sessions: sessions ?? [],
    transactions,
    hasFinancialHistory: idsWithHistory.size > 0,
  };
}

export async function getAccountHistory(id: string): Promise<AuditLogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('audit_log')
    .select('id, admin_user_id, action_type, entity_type, entity_id, before_json, after_json, created_at')
    .eq('entity_type', 'accounts')
    .eq('entity_id', id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProfileHistory(id: string): Promise<AuditLogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('audit_log')
    .select('id, admin_user_id, action_type, entity_type, entity_id, before_json, after_json, created_at')
    .eq('entity_type', 'profiles')
    .eq('entity_id', id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
