import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { trashRows } from '@/lib/trash/mutations';
import { tierHasSubscriptions } from './queries';

export interface MutationResult {
  error?: string;
}

/**
 * Suppression en cascade explicite d'un palier (section 6.1) : jamais de suppression
 * physique qui casse un historique de facturation, même logique que
 * deleteOrAnonymizeAccount / deleteOrAnonymizeProfile (src/lib/accounts/mutations.ts).
 * Si des subscriptions existent déjà sur ce palier, la suppression est bloquée — l'admin
 * doit désactiver le palier (setSubscriptionTierActive) au lieu de le supprimer. Sinon,
 * envoyé dans la corbeille (restaurable) plutôt que détruit — l'admin principal peut tout
 * supprimer, mais rien n'est jamais perdu définitivement sans passage par la corbeille.
 */
export async function deleteSubscriptionTier(input: {
  id: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const hasSubscriptions = await tierHasSubscriptions(input.id);
  if (hasSubscriptions) {
    return {
      error:
        'Ce palier a déjà été vendu (au moins un abonnement y est rattaché) : il ne peut pas être supprimé sans casser l\'historique de facturation. Désactivez-le à la place.',
    };
  }

  const supabase = await createClient();

  const { data: before, error: beforeError } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('id', input.id)
    .maybeSingle();
  if (beforeError) return { error: beforeError.message };
  if (!before) return { error: 'Palier introuvable.' };

  const { data: matrixRows, error: matrixSelectError } = await supabase
    .from('access_matrix')
    .select('*')
    .eq('tier_id', input.id);
  if (matrixSelectError) return { error: matrixSelectError.message };

  const batchId = crypto.randomUUID();

  if ((matrixRows?.length ?? 0) > 0) {
    const trashMatrix = await trashRows({
      batchId,
      tableName: 'access_matrix',
      rows: matrixRows as Record<string, unknown>[],
      adminId: input.adminId,
    });
    if (trashMatrix.error) return trashMatrix;

    const { error: matrixError } = await supabase.from('access_matrix').delete().eq('tier_id', input.id);
    if (matrixError) return { error: matrixError.message };
  }

  const trashTier = await trashRows({
    batchId,
    tableName: 'subscription_tiers',
    rows: [before as Record<string, unknown>],
    adminId: input.adminId,
  });
  if (trashTier.error) return trashTier;

  const { error } = await supabase.from('subscription_tiers').delete().eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'delete',
    entity_type: 'subscription_tiers',
    entity_id: input.id,
    before_json: before,
    after_json: null,
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function setSubscriptionTierActive(input: {
  id: string;
  isActive: boolean;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('subscription_tiers')
    .update({ is_active: input.isActive })
    .eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: input.isActive ? 'reactivate' : 'deactivate',
    entity_type: 'subscription_tiers',
    entity_id: input.id,
    before_json: { is_active: !input.isActive },
    after_json: { is_active: input.isActive },
  });
  if (auditError) return { error: auditError.message };

  return {};
}
