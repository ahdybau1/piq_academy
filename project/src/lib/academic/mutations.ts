import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { trashRows } from '@/lib/trash/mutations';
import { getProfileIdsWithFinancialHistory } from '@/lib/accounts/queries';
import {
  ROOT_NODE_TYPE,
  collectDescendantIds,
  isAncestor,
  type AcademicNodeRow,
  type AcademicNodeType,
} from './types';

/**
 * Logique métier pure de l'arbre académique. N'effectue AUCUNE vérification
 * d'autorisation — c'est la responsabilité de l'appelant (Route Handler sous
 * app/api/**). Ces fonctions ne sont jamais importées par un composant client.
 */

export interface MutationResult {
  error?: string;
}

async function fetchAllNodes(supabase: Awaited<ReturnType<typeof createClient>>): Promise<AcademicNodeRow[]> {
  const { data, error } = await supabase
    .from('academic_nodes')
    .select('id, parent_id, node_type, name, country_id, display_order, is_active, created_at');
  if (error) throw new Error(error.message);
  return data ?? [];
}

function depthOf(rows: AcademicNodeRow[], id: string): number {
  const byId = new Map(rows.map((r) => [r.id, r]));
  let depth = 0;
  let current = byId.get(id);
  while (current?.parent_id) {
    depth += 1;
    current = byId.get(current.parent_id);
  }
  return depth;
}

export async function createNode(input: {
  nodeType: AcademicNodeType;
  name: string;
  parentId: string | null;
}): Promise<MutationResult> {
  const nodeType = input.nodeType.trim();
  const name = input.name.trim();
  if (!nodeType) return { error: 'Le type de nœud est requis.' };
  if (!name) return { error: 'Le nom est requis.' };

  const supabase = await createClient();
  const rows = await fetchAllNodes(supabase);

  let parent: AcademicNodeRow | null = null;
  if (nodeType === ROOT_NODE_TYPE) {
    if (input.parentId) return { error: 'Un pays est toujours une racine, sans parent.' };
  } else {
    parent = rows.find((r) => r.id === input.parentId) ?? null;
    if (!parent) return { error: 'Le parent sélectionné est introuvable.' };
  }

  const siblingCount = rows.filter((r) => r.parent_id === (input.parentId ?? null)).length;
  const countryId = nodeType === ROOT_NODE_TYPE ? null : parent!.node_type === ROOT_NODE_TYPE ? parent!.id : parent!.country_id;

  const { error } = await supabase.from('academic_nodes').insert({
    node_type: nodeType,
    name,
    parent_id: input.parentId,
    country_id: countryId,
    display_order: siblingCount,
    is_active: true,
  });

  if (error) return { error: error.message };
  return {};
}

export async function updateNode(input: { id: string; name: string }): Promise<MutationResult> {
  const name = input.name.trim();
  if (!name) return { error: 'Le nom est requis.' };

  const supabase = await createClient();
  const { error } = await supabase.from('academic_nodes').update({ name }).eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}

export async function setNodeActive(input: { id: string; isActive: boolean }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('academic_nodes')
    .update({ is_active: input.isActive })
    .eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}

/** Snapshote puis supprime les lignes déjà chargées d'une table, sous le même lot. */
async function trashAndDelete(
  client: ReturnType<typeof createAdminClient>,
  input: { batchId: string; tableName: string; rows: Record<string, unknown>[]; adminId: string | null }
): Promise<MutationResult> {
  if (input.rows.length === 0) return {};
  const trashResult = await trashRows(input);
  if (trashResult.error) return trashResult;
  const ids = input.rows.map((r) => r.id as string);
  const { error } = await client.from(input.tableName).delete().in('id', ids);
  if (error) return { error: error.message };
  return {};
}

export async function deleteNode(input: {
  id: string;
  cascade: boolean;
  adminRole: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();
  const rows = await fetchAllNodes(supabase);
  const descendants = collectDescendantIds(rows, input.id);
  const toDelete = [input.id, ...descendants];
  const batchId = crypto.randomUUID();

  // Tout est lu via le client admin (service_role) : plusieurs de ces tables (paliers,
  // profils) sont réservées au Super-admin par RLS, donc un autre rôle ne verrait jamais
  // ces lignes silencieusement, faussant la détection de dépendances.
  const admin = createAdminClient();

  const [tierRes, profileRes, examRes, paperRes, threadRes, whatsappRes, translationRes, subjectLinkRes] =
    await Promise.all([
      admin.from('subscription_tiers').select('*', { count: 'exact' }).in('class_node_id', toDelete),
      admin.from('profiles').select('*', { count: 'exact' }).in('class_node_id', toDelete),
      admin.from('official_exams').select('*', { count: 'exact' }).in('class_node_id', toDelete),
      admin.from('establishment_papers').select('*', { count: 'exact' }).in('class_node_id', toDelete),
      admin.from('forum_threads').select('*', { count: 'exact' }).in('class_node_id', toDelete),
      admin.from('whatsapp_communities').select('*', { count: 'exact' }).in('class_node_id', toDelete),
      admin.from('content_translation_classes').select('*', { count: 'exact' }).in('class_node_id', toDelete),
      admin.from('subject_class_links').select('*', { count: 'exact' }).in('class_node_id', toDelete),
    ]);
  if (tierRes.error) return { error: tierRes.error.message };
  if (profileRes.error) return { error: profileRes.error.message };
  if (examRes.error) return { error: examRes.error.message };
  if (paperRes.error) return { error: paperRes.error.message };
  if (threadRes.error) return { error: threadRes.error.message };
  if (whatsappRes.error) return { error: whatsappRes.error.message };
  if (translationRes.error) return { error: translationRes.error.message };
  if (subjectLinkRes.error) return { error: subjectLinkRes.error.message };

  const linkedContentCount =
    (paperRes.count ?? 0) + (whatsappRes.count ?? 0) + (translationRes.count ?? 0) + (subjectLinkRes.count ?? 0);

  if (
    !input.cascade &&
    (descendants.length > 0 ||
      (tierRes.count ?? 0) > 0 ||
      (profileRes.count ?? 0) > 0 ||
      (examRes.count ?? 0) > 0 ||
      (threadRes.count ?? 0) > 0 ||
      linkedContentCount > 0)
  ) {
    const parts: string[] = [];
    if (descendants.length > 0) parts.push(`${descendants.length} descendant(s)`);
    if ((tierRes.count ?? 0) > 0) parts.push(`${tierRes.count} palier(s) d'abonnement rattaché(s)`);
    if ((profileRes.count ?? 0) > 0) parts.push(`${profileRes.count} profil(s) élève rattaché(s)`);
    if ((examRes.count ?? 0) > 0) parts.push(`${examRes.count} examen(s) officiel(s)`);
    if ((threadRes.count ?? 0) > 0) parts.push(`${threadRes.count} sujet(s) de forum`);
    if (linkedContentCount > 0) parts.push(`${linkedContentCount} autre(s) élément(s) lié(s)`);
    return {
      error: `Ce nœud a des dépendances (${parts.join(', ')}). Cochez « supprimer aussi le contenu lié » pour continuer.`,
    };
  }

  // Profils élève et paliers d'abonnement : seul le Super-admin ("admin principal") peut
  // les envoyer en cascade vers la corbeille — les autres rôles restent bloqués par le
  // message ci-dessus tant que ces dépendances existent, cascade cochée ou non.
  if (((tierRes.count ?? 0) > 0 || (profileRes.count ?? 0) > 0) && input.adminRole !== 'super_admin') {
    return {
      error:
        "Ce nœud a des profils élève et/ou paliers d'abonnement rattachés : seul le Super-admin peut supprimer un nœud dans ce cas.",
    };
  }

  // Un profil avec un historique réel (subscriptions/transactions) : ces lignes
  // référencent profile_id sans cascade, donc bloqueraient la suppression du profil.
  // Comme pour tout le reste aujourd'hui, on ne bloque pas — on met en corbeille
  // (restaurable) plutôt que de supprimer bêtement. Réservé au Super-admin (déjà vérifié
  // plus haut pour ce bloc profils/paliers).
  const allProfileIds = (profileRes.data ?? []).map((p) => p.id as string);
  const profileIdsWithHistory = await getProfileIdsWithFinancialHistory(admin, allProfileIds);
  if (profileIdsWithHistory.size > 0) {
    const historyIds = Array.from(profileIdsWithHistory);

    const { data: subsToTrash, error: subsSelectError } = await admin
      .from('subscriptions')
      .select('*')
      .in('profile_id', historyIds);
    if (subsSelectError) return { error: subsSelectError.message };
    const trashSubsResult = await trashAndDelete(admin, {
      batchId,
      tableName: 'subscriptions',
      rows: (subsToTrash ?? []) as Record<string, unknown>[],
      adminId: input.adminId,
    });
    if (trashSubsResult.error) return trashSubsResult;

    const { data: txsToTrash, error: txsSelectError } = await admin
      .from('transactions')
      .select('*')
      .in('profile_id', historyIds);
    if (txsSelectError) return { error: txsSelectError.message };
    const trashTxsResult = await trashAndDelete(admin, {
      batchId,
      tableName: 'transactions',
      rows: (txsToTrash ?? []) as Record<string, unknown>[],
      adminId: input.adminId,
    });
    if (trashTxsResult.error) return trashTxsResult;
  }

  // Autres tables mineures dépendant d'un profil (mêmes que
  // src/lib/accounts/mutations.ts:cascadeDeleteProfileDependents) : nettoyées avant de
  // pouvoir supprimer les profils eux-mêmes.
  if (allProfileIds.length > 0) {
    const { data: eventResults, error: eventResultsError } = await admin
      .from('event_results')
      .select('id')
      .in('profile_id', allProfileIds);
    if (eventResultsError) return { error: eventResultsError.message };
    const eventResultIds = (eventResults ?? []).map((r) => r.id as string);
    if (eventResultIds.length > 0) {
      const { error: disputesError } = await admin.from('grade_disputes').delete().in('event_result_id', eventResultIds);
      if (disputesError) return { error: disputesError.message };
    }

    const minorDependentTables = [
      'event_results',
      'referral_codes',
      'refund_requests',
      'scheduled_reminders',
      'notification_log',
      'monthly_spend_counter',
      'parent_profile_links',
      'generated_documents',
    ] as const;
    for (const table of minorDependentTables) {
      const { error: minorError } = await admin.from(table).delete().in('profile_id', allProfileIds);
      if (minorError) return { error: minorError.message };
    }
  }

  // profiles.class_node_id est NOT NULL, donc pas de "détachement" possible comme pour
  // les paliers ci-dessous — le profil part entier dans la corbeille, restaurable.
  const trashProfilesResult = await trashAndDelete(admin, {
    batchId,
    tableName: 'profiles',
    rows: (profileRes.data ?? []) as Record<string, unknown>[],
    adminId: input.adminId,
  });
  if (trashProfilesResult.error) return trashProfilesResult;

  if ((tierRes.data?.length ?? 0) > 0) {
    const tierIds = tierRes.data!.map((t) => t.id as string);

    // Jamais de suppression physique d'un palier déjà vendu (historique de facturation) —
    // voir src/lib/subscriptions/mutations.ts pour la même règle appliquée à la
    // suppression directe d'un palier. Ici, le nœud doit quand même pouvoir être
    // supprimé : le palier vendu est désactivé + détaché (jamais trashé/supprimé), son
    // historique et son accès restent intacts et consultables normalement.
    const { data: soldTiers, error: soldTiersError } = await admin
      .from('subscriptions')
      .select('tier_id')
      .in('tier_id', tierIds);
    if (soldTiersError) return { error: soldTiersError.message };
    const soldTierIds = new Set((soldTiers ?? []).map((s) => s.tier_id));

    const deletableTiers = tierRes.data!.filter((t) => !soldTierIds.has(t.id as string));

    if (soldTierIds.size > 0) {
      const { error: detachError } = await admin
        .from('subscription_tiers')
        .update({ class_node_id: null, is_active: false })
        .in('id', Array.from(soldTierIds));
      if (detachError) return { error: detachError.message };
    }

    if (deletableTiers.length > 0) {
      const deletableTierIds = deletableTiers.map((t) => t.id as string);
      const { data: matrixRows, error: matrixSelectError } = await admin
        .from('access_matrix')
        .select('*')
        .in('tier_id', deletableTierIds);
      if (matrixSelectError) return { error: matrixSelectError.message };

      const matrixResult = await trashAndDelete(admin, {
        batchId,
        tableName: 'access_matrix',
        rows: (matrixRows ?? []) as Record<string, unknown>[],
        adminId: input.adminId,
      });
      if (matrixResult.error) return matrixResult;

      const tierTrashResult = await trashAndDelete(admin, {
        batchId,
        tableName: 'subscription_tiers',
        rows: deletableTiers as Record<string, unknown>[],
        adminId: input.adminId,
      });
      if (tierTrashResult.error) return tierTrashResult;
    }
  }

  // Contenu pédagogique/communautaire lié : aucune notion de "vendu"/historique financier
  // dans le schéma (contrairement à profiles/subscription_tiers ci-dessus) — trashé avec
  // le nœud comme les descendants, sans blocage séparé.
  if ((examRes.data?.length ?? 0) > 0) {
    const examIds = examRes.data!.map((e) => e.id as string);
    const { data: examPapers, error: examPapersSelectError } = await admin
      .from('exam_papers')
      .select('*')
      .in('exam_id', examIds);
    if (examPapersSelectError) return { error: examPapersSelectError.message };

    const examPapersResult = await trashAndDelete(admin, {
      batchId,
      tableName: 'exam_papers',
      rows: (examPapers ?? []) as Record<string, unknown>[],
      adminId: input.adminId,
    });
    if (examPapersResult.error) return examPapersResult;

    const examsResult = await trashAndDelete(admin, {
      batchId,
      tableName: 'official_exams',
      rows: examRes.data as Record<string, unknown>[],
      adminId: input.adminId,
    });
    if (examsResult.error) return examsResult;
  }

  const paperResult = await trashAndDelete(admin, {
    batchId,
    tableName: 'establishment_papers',
    rows: (paperRes.data ?? []) as Record<string, unknown>[],
    adminId: input.adminId,
  });
  if (paperResult.error) return paperResult;

  if ((threadRes.data?.length ?? 0) > 0) {
    const threadIds = threadRes.data!.map((t) => t.id as string);
    const { data: posts, error: postsSelectError } = await admin
      .from('forum_posts')
      .select('*')
      .in('thread_id', threadIds);
    if (postsSelectError) return { error: postsSelectError.message };

    const postsResult = await trashAndDelete(admin, {
      batchId,
      tableName: 'forum_posts',
      rows: (posts ?? []) as Record<string, unknown>[],
      adminId: input.adminId,
    });
    if (postsResult.error) return postsResult;

    const threadsResult = await trashAndDelete(admin, {
      batchId,
      tableName: 'forum_threads',
      rows: threadRes.data as Record<string, unknown>[],
      adminId: input.adminId,
    });
    if (threadsResult.error) return threadsResult;
  }

  const whatsappResult = await trashAndDelete(admin, {
    batchId,
    tableName: 'whatsapp_communities',
    rows: (whatsappRes.data ?? []) as Record<string, unknown>[],
    adminId: input.adminId,
  });
  if (whatsappResult.error) return whatsappResult;

  const translationResult = await trashAndDelete(admin, {
    batchId,
    tableName: 'content_translation_classes',
    rows: (translationRes.data ?? []) as Record<string, unknown>[],
    adminId: input.adminId,
  });
  if (translationResult.error) return translationResult;

  // subject_class_links n'a pas de colonne id propre (clé composite) — trashRows() ne
  // s'appuie que sur le JSON, mais trashAndDelete() a besoin d'un id pour le DELETE :
  // on supprime directement par class_node_id après le snapshot.
  if ((subjectLinkRes.data?.length ?? 0) > 0) {
    const linkTrashResult = await trashRows({
      batchId,
      tableName: 'subject_class_links',
      rows: subjectLinkRes.data as Record<string, unknown>[],
      adminId: input.adminId,
    });
    if (linkTrashResult.error) return linkTrashResult;

    const { error: subjectLinkError } = await admin.from('subject_class_links').delete().in('class_node_id', toDelete);
    if (subjectLinkError) return { error: subjectLinkError.message };
  }

  // Les nœuds eux-mêmes, en dernier : trashés (parents avant enfants pour une
  // restauration topologique correcte), puis supprimés dans l'ordre inverse (enfants
  // avant parents, pour respecter parent_id).
  const nodesToTrash = rows.filter((r) => toDelete.includes(r.id));
  const nodesTrashResult = await trashRows({
    batchId,
    tableName: 'academic_nodes',
    rows: nodesToTrash as unknown as Record<string, unknown>[],
    adminId: input.adminId,
  });
  if (nodesTrashResult.error) return nodesTrashResult;

  const orderedForDeletion = toDelete.sort((a, b) => depthOf(rows, b) - depthOf(rows, a));

  for (const id of orderedForDeletion) {
    const { error } = await admin.from('academic_nodes').delete().eq('id', id);
    if (error) return { error: error.message };
  }
  return {};
}

export async function moveNode(input: { id: string; newParentId: string | null }): Promise<MutationResult> {
  const supabase = await createClient();
  const rows = await fetchAllNodes(supabase);

  const node = rows.find((r) => r.id === input.id);
  if (!node) return { error: 'Nœud introuvable.' };

  if (node.node_type === ROOT_NODE_TYPE) {
    return { error: 'Un pays est toujours une racine ; il ne peut pas être déplacé sous un parent.' };
  }
  if (!input.newParentId) return { error: 'Un parent est requis pour ce type de nœud.' };
  if (input.newParentId === input.id) return { error: 'Un nœud ne peut pas être son propre parent.' };

  const newParent = rows.find((r) => r.id === input.newParentId);
  if (!newParent) return { error: 'Le nouveau parent est introuvable.' };

  if (isAncestor(rows, node.id, newParent.id)) {
    return { error: 'Destination invalide : ce nœud est un descendant du nœud déplacé.' };
  }

  const newCountryId = newParent.node_type === ROOT_NODE_TYPE ? newParent.id : newParent.country_id;
  const descendants = collectDescendantIds(rows, input.id);

  const { error } = await supabase
    .from('academic_nodes')
    .update({ parent_id: input.newParentId, country_id: newCountryId })
    .eq('id', input.id);
  if (error) return { error: error.message };

  if (descendants.length > 0) {
    const { error: descError } = await supabase
      .from('academic_nodes')
      .update({ country_id: newCountryId })
      .in('id', descendants);
    if (descError) return { error: descError.message };
  }
  return {};
}

export async function duplicateNode(input: { id: string }): Promise<MutationResult> {
  const supabase = await createClient();
  const rows = await fetchAllNodes(supabase);

  const original = rows.find((r) => r.id === input.id);
  if (!original) return { error: 'Nœud introuvable.' };

  const descendantIds = new Set(collectDescendantIds(rows, input.id));
  const subtree = rows.filter((r) => r.id === input.id || descendantIds.has(r.id));

  const childrenByParent = new Map<string, AcademicNodeRow[]>();
  subtree.forEach((r) => {
    if (r.parent_id === null) return;
    childrenByParent.set(r.parent_id, [...(childrenByParent.get(r.parent_id) ?? []), r]);
  });

  const isPaysRoot = original.node_type === ROOT_NODE_TYPE;
  const idMap = new Map<string, string>();
  const siblingCountAtRoot = rows.filter((r) => r.parent_id === original.parent_id).length;

  const insertOne = async (row: AcademicNodeRow, newParentId: string | null, order: number) => {
    const isRoot = row.id === original.id;
    const countryId = row.node_type === ROOT_NODE_TYPE
      ? null
      : isPaysRoot
        ? idMap.get(row.country_id ?? '') ?? null
        : row.country_id;

    const { data, error } = await supabase
      .from('academic_nodes')
      .insert({
        node_type: row.node_type,
        name: isRoot ? `${row.name} (copie)` : row.name,
        parent_id: newParentId,
        country_id: countryId,
        display_order: order,
        is_active: row.is_active,
      })
      .select('id')
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Échec de la duplication.');
    idMap.set(row.id, data.id);
  };

  try {
    await insertOne(original, original.parent_id, siblingCountAtRoot);

    const queue = [original.id];
    while (queue.length) {
      const originalParentId = queue.shift()!;
      const children = childrenByParent.get(originalParentId) ?? [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        await insertOne(child, idMap.get(originalParentId)!, i);
        queue.push(child.id);
      }
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Échec de la duplication.' };
  }
  return {};
}
