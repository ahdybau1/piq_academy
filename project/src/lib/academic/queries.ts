import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AcademicNodeRow, AcademicNodeDependencies, AuditLogEntry } from './types';

/**
 * @param countryId Filtre optionnel : ne retourne que le nœud pays racine et ses
 * descendants (les nœuds `pays` stockent `country_id = null`, d'où le `.or()` sur leur
 * propre id). Omis ou `undefined`, le comportement est inchangé (tous les nœuds).
 */
export async function listAcademicNodes(countryId?: string): Promise<AcademicNodeRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from('academic_nodes')
    .select('id, parent_id, node_type, name, country_id, display_order, is_active, created_at')
    .order('display_order', { ascending: true });

  if (countryId) {
    query = query.or(`id.eq.${countryId},country_id.eq.${countryId}`);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getNodeDependencies(nodeId: string): Promise<AcademicNodeDependencies> {
  const supabase = await createClient();
  // Client admin (service_role) : subscription_tiers/profiles ont des policies RLS
  // restrictives (super_admin uniquement pour la première) — un aperçu via le client RLS
  // normal verrait silencieusement 0 ligne pour un rôle non couvert, faussant l'aperçu des
  // dépendances affiché dans la boîte de suppression (voir la même correction dans
  // deleteNode, src/lib/academic/mutations.ts).
  const admin = createAdminClient();

  const [childRes, subjectRes, profileRes, tierRes, examRes, paperRes, forumRes, whatsappRes, translationRes] =
    await Promise.all([
      supabase.from('academic_nodes').select('id', { count: 'exact', head: true }).eq('parent_id', nodeId),
      admin.from('subject_class_links').select('subject_id', { count: 'exact', head: true }).eq('class_node_id', nodeId),
      // Tous statuts confondus (pas seulement 'actif') : un profil archivé a toujours son
      // class_node_id rempli et bloque donc tout autant la suppression du nœud au niveau
      // de la contrainte de clé étrangère — voir la même logique dans deleteNode.
      admin.from('profiles').select('id', { count: 'exact', head: true }).eq('class_node_id', nodeId),
      admin.from('subscription_tiers').select('id', { count: 'exact', head: true }).eq('class_node_id', nodeId),
      admin.from('official_exams').select('id', { count: 'exact', head: true }).eq('class_node_id', nodeId),
      admin.from('establishment_papers').select('id', { count: 'exact', head: true }).eq('class_node_id', nodeId),
      admin.from('forum_threads').select('id', { count: 'exact', head: true }).eq('class_node_id', nodeId),
      admin.from('whatsapp_communities').select('id', { count: 'exact', head: true }).eq('class_node_id', nodeId),
      admin
        .from('content_translation_classes')
        .select('id', { count: 'exact', head: true })
        .eq('class_node_id', nodeId),
    ]);

  return {
    childCount: childRes.count ?? 0,
    linkedSubjectCount: subjectRes.count ?? 0,
    activeProfileCount: profileRes.count ?? 0,
    subscriptionTierCount: tierRes.count ?? 0,
    officialExamCount: examRes.count ?? 0,
    establishmentPaperCount: paperRes.count ?? 0,
    forumThreadCount: forumRes.count ?? 0,
    whatsappCommunityCount: whatsappRes.count ?? 0,
    contentTranslationClassCount: translationRes.count ?? 0,
  };
}

export async function getNodeHistory(nodeId: string): Promise<AuditLogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('audit_log')
    .select('id, admin_user_id, action_type, entity_type, entity_id, before_json, after_json, created_at')
    .eq('entity_type', 'academic_nodes')
    .eq('entity_id', nodeId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
