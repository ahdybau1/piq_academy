import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { SubscriptionTierRow } from './types';

/**
 * @param countryId Filtre optionnel : ne retourne que les paliers dont `class_node_id`
 * appartient à ce pays (racine ou descendant). Omis ou `undefined`, comportement inchangé
 * (tous les paliers).
 */
export async function listSubscriptionTiers(countryId?: string): Promise<SubscriptionTierRow[]> {
  const supabase = await createClient();

  if (countryId) {
    const { data: nodeData, error: nodeError } = await supabase
      .from('academic_nodes')
      .select('id')
      .or(`id.eq.${countryId},country_id.eq.${countryId}`);
    if (nodeError) throw new Error(nodeError.message);

    const nodeIds = (nodeData ?? []).map((n) => n.id);
    if (nodeIds.length === 0) return [];

    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('id, name, class_node_id, price, is_active, created_at')
      .in('class_node_id', nodeIds)
      .order('price', { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

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
