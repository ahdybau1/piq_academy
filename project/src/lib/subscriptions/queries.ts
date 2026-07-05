import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { SubscriptionTierRow } from './types';

export async function listSubscriptionTiers(): Promise<SubscriptionTierRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('id, name, class_node_id, price, is_active, created_at')
    .order('price', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Un palier déjà vendu (au moins un abonnement, actif ou passé) ne peut pas être supprimé. */
export async function tierHasSubscriptions(tierId: string): Promise<boolean> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('tier_id', tierId);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
