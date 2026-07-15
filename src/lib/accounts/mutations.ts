import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { trashRows } from '@/lib/trash/mutations';
import { getProfileIdsWithFinancialHistory, type SupabaseServerClient } from './queries';

/**
 * Logique métier pure des comptes/profils élève. N'effectue AUCUNE vérification
 * d'autorisation — c'est la responsabilité de l'appelant (Route Handler sous
 * app/api/**). Ces fonctions ne sont jamais importées par un composant client.
 */

export interface MutationResult {
  error?: string;
}

/** ~100 ans : équivaut à une suspension jusqu'à réactivation explicite. */
const PERMANENT_BAN_DURATION = '876000h';

/** Déterministe : sert aussi à détecter si un compte est déjà anonymisé. */
function anonymizedEmailFor(accountId: string): string {
  return `deleted-${accountId}@piqacademy.local`;
}

/**
 * Supprime les lignes rattachées à un profil qui n'ont AUCUNE portée comptable/légale
 * (contrairement à subscriptions/transactions, jamais supprimées — voir anonymizeAccount).
 * Appelé uniquement quand profileIdsWithFinancialHistory a confirmé l'absence de
 * subscription/transaction pour ce profil : la suppression physique reste alors possible.
 */
async function cascadeDeleteProfileDependents(
  supabase: SupabaseServerClient,
  profileId: string
): Promise<MutationResult> {
  const { data: eventResults, error: eventResultsError } = await supabase
    .from('event_results')
    .select('id')
    .eq('profile_id', profileId);
  if (eventResultsError) return { error: eventResultsError.message };

  const eventResultIds = (eventResults ?? []).map((r) => r.id);
  if (eventResultIds.length > 0) {
    const { error } = await supabase.from('grade_disputes').delete().in('event_result_id', eventResultIds);
    if (error) return { error: error.message };
  }

  const dependentTables = [
    'event_results',
    'referral_codes',
    'refund_requests',
    'scheduled_reminders',
    'notification_log',
    'monthly_spend_counter',
    'parent_profile_links',
    'generated_documents',
  ] as const;

  for (const table of dependentTables) {
    const { error } = await supabase.from(table).delete().eq('profile_id', profileId);
    if (error) return { error: error.message };
  }
  return {};
}

/**
 * Remplace les données personnelles du compte par des valeurs génériques et bannit
 * définitivement l'accès Auth, au lieu d'une suppression physique — utilisé quand au
 * moins un profil du compte a une subscription/transaction liée (traçabilité
 * comptable/litige : ces lignes ne sont jamais supprimées ni modifiées).
 */
async function anonymizeAccount(input: { accountId: string; adminUserId: string | null }): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: before, error: beforeError } = await supabase
    .from('accounts')
    .select('first_name, last_name, email, phone, status')
    .eq('id', input.accountId)
    .maybeSingle();
  if (beforeError) return { error: beforeError.message };
  if (!before) return { error: 'Compte introuvable.' };

  const anonymizedEmail = anonymizedEmailFor(input.accountId);
  // Déjà anonymisé : ne pas ré-écraser before_json (seule source de restauration) avec
  // des données déjà génériques, et ne pas re-notifier Auth inutilement.
  if (before.email === anonymizedEmail) return {};

  const after = {
    first_name: 'Utilisateur',
    last_name: 'supprimé',
    email: anonymizedEmail,
    phone: null,
    status: 'suspendu' as const,
  };

  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(input.accountId, {
    email: anonymizedEmail,
    ban_duration: PERMANENT_BAN_DURATION,
  });
  if (authError) return { error: authError.message };

  const { error } = await supabase.from('accounts').update(after).eq('id', input.accountId);
  if (error) return { error: error.message };

  // Client admin (service_role) : le before_json est la seule source de restauration
  // (restoreAccountIdentity), donc cette écriture ne doit jamais être bloquée par une
  // policy RLS pensée pour le trigger d'audit générique plutôt que pour cette écriture
  // applicative explicite.
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminUserId,
    action_type: 'anonymize',
    entity_type: 'accounts',
    entity_id: input.accountId,
    before_json: before,
    after_json: after,
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * Restaure les données personnelles d'un compte anonymisé, à partir du before_json de
 * la dernière entrée audit_log action_type='anonymize' — seule source conservée de
 * l'identité d'origine (voir anonymizeAccount). No-op si le compte n'est pas anonymisé.
 */
async function restoreAccountIdentity(input: {
  accountId: string;
  adminUserId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('email')
    .eq('id', input.accountId)
    .maybeSingle();
  if (accountError) return { error: accountError.message };
  if (!account) return { error: 'Compte introuvable.' };

  if (account.email !== anonymizedEmailFor(input.accountId)) return {};

  // Client admin : voir le commentaire équivalent dans anonymizeAccount — la lecture doit
  // marcher indépendamment de la policy RLS d'audit_log.
  const admin = createAdminClient();
  const { data: lastAnonymize, error: historyError } = await admin
    .from('audit_log')
    .select('before_json')
    .eq('entity_type', 'accounts')
    .eq('entity_id', input.accountId)
    .eq('action_type', 'anonymize')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (historyError) return { error: historyError.message };

  const original = lastAnonymize?.before_json as
    | { first_name: string; last_name: string; email: string; phone: string | null }
    | null
    | undefined;
  if (!original) {
    return { error: "Impossible de restaurer : aucun historique d'anonymisation trouvé pour ce compte." };
  }

  const { error: authError } = await admin.auth.admin.updateUserById(input.accountId, { email: original.email });
  if (authError) return { error: authError.message };

  const { error } = await supabase
    .from('accounts')
    .update({
      first_name: original.first_name,
      last_name: original.last_name,
      email: original.email,
      phone: original.phone,
    })
    .eq('id', input.accountId);
  if (error) return { error: error.message };

  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminUserId,
    action_type: 'restore',
    entity_type: 'accounts',
    entity_id: input.accountId,
    before_json: { email: anonymizedEmailFor(input.accountId) },
    after_json: original,
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * Création manuelle d'un compte élève par un admin (section 13.4 du cahier des
 * charges). Crée l'utilisateur Auth d'abord (avec mot de passe défini par
 * l'admin), puis la ligne accounts avec le même id — dans cet ordre précis,
 * pour ne jamais avoir une ligne accounts orpheline sans utilisateur Auth.
 */
export async function createAccount(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string;
  adminUserId: string | null;
}): Promise<MutationResult> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim();
  if (!firstName || !lastName) return { error: 'Le prénom et le nom sont requis.' };
  if (!email) return { error: "L'email est requis." };
  if (input.password.length < 8) return { error: 'Le mot de passe doit contenir au moins 8 caractères.' };

  const admin = createAdminClient();
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
  });
  if (authError) return { error: authError.message };

  const supabase = await createClient();
  const { error } = await supabase.from('accounts').insert({
    id: created.user.id,
    email,
    first_name: firstName,
    last_name: lastName,
    phone: input.phone,
    status: 'actif',
  });
  if (error) {
    // La ligne accounts n'a pas pu être créée : ne pas laisser un utilisateur Auth orphelin.
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: error.message };
  }

  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminUserId,
    action_type: 'create',
    entity_type: 'accounts',
    entity_id: created.user.id,
    before_json: null,
    after_json: { first_name: firstName, last_name: lastName, email, phone: input.phone },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function updateAccount(input: {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email?: string;
}): Promise<MutationResult> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!firstName || !lastName) return { error: 'Le prénom et le nom sont requis.' };

  if (input.email) {
    const admin = createAdminClient();
    const { error: authError } = await admin.auth.admin.updateUserById(input.id, { email: input.email });
    if (authError) return { error: authError.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('accounts')
    .update({
      first_name: firstName,
      last_name: lastName,
      phone: input.phone,
      ...(input.email ? { email: input.email } : {}),
    })
    .eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}

export async function setAccountStatus(input: {
  id: string;
  status: 'actif' | 'suspendu';
  adminUserId: string | null;
}): Promise<MutationResult> {
  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(input.id, {
    ban_duration: input.status === 'suspendu' ? PERMANENT_BAN_DURATION : 'none',
  });
  if (authError) return { error: authError.message };

  // Réactiver un compte anonymisé doit rendre son identité d'origine, pas seulement
  // débloquer l'accès — voir restoreAccountIdentity.
  if (input.status === 'actif') {
    const restoreResult = await restoreAccountIdentity({ accountId: input.id, adminUserId: input.adminUserId });
    if (restoreResult.error) return restoreResult;
  }

  const supabase = await createClient();
  const { error } = await supabase.from('accounts').update({ status: input.status }).eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}

/**
 * Si un des profils du compte a une subscription/transaction liée : anonymise le compte
 * au lieu de le supprimer (les profils concernés passent à 'archivé', rien n'est
 * supprimé chez eux). Sinon, suppression physique complète comme avant.
 */
export async function deleteOrAnonymizeAccount(input: {
  id: string;
  adminUserId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').eq('account_id', input.id);
  if (profilesError) return { error: profilesError.message };

  const profileIds = (profiles ?? []).map((p) => p.id);
  const idsWithHistory = await getProfileIdsWithFinancialHistory(supabase, profileIds);

  if (idsWithHistory.size > 0) {
    const anonymizeResult = await anonymizeAccount({ accountId: input.id, adminUserId: input.adminUserId });
    console.error('[deleteOrAnonymizeAccount] anonymizeResult:', JSON.stringify(anonymizeResult));
    if (anonymizeResult.error) return anonymizeResult;

    if (profileIds.length > 0) {
      const { error } = await supabase.from('profiles').update({ status: 'archivé' }).in('id', profileIds);
      if (error) {
        console.error('[deleteOrAnonymizeAccount] profiles update error:', JSON.stringify(error));
        return { error: error.message };
      }
    }

    const { error: sessionsError } = await supabase.from('sessions').delete().eq('account_id', input.id);
    if (sessionsError) {
      console.error('[deleteOrAnonymizeAccount] sessions delete error:', JSON.stringify(sessionsError));
      return { error: sessionsError.message };
    }

    return {};
  }

  for (const profileId of profileIds) {
    const cascadeResult = await cascadeDeleteProfileDependents(supabase, profileId);
    if (cascadeResult.error) {
      console.error('[deleteOrAnonymizeAccount] cascadeResult error:', JSON.stringify(cascadeResult));
      return cascadeResult;
    }
  }

  // Compte et profils envoyés dans la corbeille (restaurables) avant suppression réelle —
  // l'admin principal peut tout supprimer, mais rien n'est perdu sans passage par la
  // corbeille. Limite connue : l'identité Auth (email/mot de passe) est supprimée plus bas
  // sans snapshot possible (hors du schéma `public`) — une restauration recrée le compte et
  // les profils, mais l'utilisateur devra redéfinir son mot de passe pour se reconnecter.
  const batchId = crypto.randomUUID();
  const { data: accountBefore, error: accountBeforeError } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', input.id)
    .maybeSingle();
  if (accountBeforeError) return { error: accountBeforeError.message };
  if (!accountBefore) return { error: 'Compte introuvable.' };

  if ((profiles?.length ?? 0) > 0) {
    const trashProfilesResult = await trashRows({
      batchId,
      tableName: 'profiles',
      rows: profiles as Record<string, unknown>[],
      adminId: input.adminUserId,
    });
    if (trashProfilesResult.error) return trashProfilesResult;
  }

  const { error: profilesDeleteError } = await supabase.from('profiles').delete().eq('account_id', input.id);
  if (profilesDeleteError) {
    console.error('[deleteOrAnonymizeAccount] profiles delete error:', JSON.stringify(profilesDeleteError));
    return { error: profilesDeleteError.message };
  }

  const { error: sessionsError } = await supabase.from('sessions').delete().eq('account_id', input.id);
  if (sessionsError) {
    console.error('[deleteOrAnonymizeAccount] sessions delete error:', JSON.stringify(sessionsError));
    return { error: sessionsError.message };
  }

  const trashAccountResult = await trashRows({
    batchId,
    tableName: 'accounts',
    rows: [accountBefore as Record<string, unknown>],
    adminId: input.adminUserId,
  });
  if (trashAccountResult.error) return trashAccountResult;

  // La ligne accounts doit disparaître avant l'appel à deleteUser : accounts.id référence
  // auth.users.id sans cascade, donc Supabase Auth refuse (500) de supprimer l'utilisateur
  // tant que cette ligne existe encore.
  const { error } = await supabase.from('accounts').delete().eq('id', input.id);
  if (error) {
    console.error('[deleteOrAnonymizeAccount] accounts delete error:', JSON.stringify(error));
    return { error: error.message };
  }

  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.deleteUser(input.id);
  if (authError) {
    console.error('[deleteOrAnonymizeAccount] auth deleteUser error:', JSON.stringify(authError), authError);
    return { error: authError.message };
  }

  return {};
}

export async function forceLogout(input: { accountId: string }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('sessions').update({ is_active: false }).eq('account_id', input.accountId);
  if (error) return { error: error.message };
  return {};
}

export async function resetPassword(input: { email: string }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(input.email);
  if (error) return { error: error.message };
  return {};
}

export async function updateProfile(input: {
  id: string;
  classNodeId: string;
  schoolYear: string;
}): Promise<MutationResult> {
  if (!input.classNodeId) return { error: 'La classe est requise.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ class_node_id: input.classNodeId, school_year: input.schoolYear })
    .eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}

export async function setProfileStatus(input: { id: string; status: 'actif' | 'archivé' }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ status: input.status }).eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}

/**
 * Si le profil a une subscription/transaction liée : anonymise le compte associé (les
 * données personnelles, pas seulement ce profil) et archive ce profil, sans rien
 * supprimer côté paiements. Sinon, suppression physique complète comme avant.
 */
export async function deleteOrAnonymizeProfile(input: {
  id: string;
  adminUserId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', input.id)
    .maybeSingle();
  if (profileError) return { error: profileError.message };
  if (!profile) return { error: 'Profil introuvable.' };

  const idsWithHistory = await getProfileIdsWithFinancialHistory(supabase, [input.id]);

  if (idsWithHistory.has(input.id)) {
    const anonymizeResult = await anonymizeAccount({
      accountId: profile.account_id,
      adminUserId: input.adminUserId,
    });
    if (anonymizeResult.error) return anonymizeResult;

    const { error } = await supabase.from('profiles').update({ status: 'archivé' }).eq('id', input.id);
    if (error) return { error: error.message };

    const admin = createAdminClient();
    const { error: auditError } = await admin.from('audit_log').insert({
      admin_user_id: input.adminUserId,
      action_type: 'anonymize',
      entity_type: 'profiles',
      entity_id: input.id,
      before_json: { status: profile.status },
      after_json: { status: 'archivé' },
    });
    if (auditError) return { error: auditError.message };

    return {};
  }

  const cascadeResult = await cascadeDeleteProfileDependents(supabase, input.id);
  if (cascadeResult.error) return cascadeResult;

  const trashProfileResult = await trashRows({
    batchId: crypto.randomUUID(),
    tableName: 'profiles',
    rows: [profile as Record<string, unknown>],
    adminId: input.adminUserId,
  });
  if (trashProfileResult.error) return trashProfileResult;

  const { error } = await supabase.from('profiles').delete().eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}

export async function transferProfile(input: { id: string; newAccountId: string }): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: newAccount, error: accountError } = await supabase
    .from('accounts')
    .select('id')
    .eq('id', input.newAccountId)
    .maybeSingle();
  if (accountError) return { error: accountError.message };
  if (!newAccount) return { error: 'Compte de destination introuvable.' };

  const { error } = await supabase.from('profiles').update({ account_id: input.newAccountId }).eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}
