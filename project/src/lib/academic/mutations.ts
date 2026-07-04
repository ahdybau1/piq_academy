import 'server-only';
import { createClient } from '@/lib/supabase/server';
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

export async function deleteNode(input: { id: string; cascade: boolean }): Promise<MutationResult> {
  const supabase = await createClient();
  const rows = await fetchAllNodes(supabase);
  const descendants = collectDescendantIds(rows, input.id);
  const toDelete = [input.id, ...descendants];

  // Chaque nœud (créé via l'interface) reçoit automatiquement un palier gratuit
  // (trigger `trg_create_free_tier` sur academic_nodes) référencé par
  // subscription_tiers.class_node_id — une contrainte de clé étrangère bloque
  // donc la suppression tant que ces lignes n'ont pas été traitées.
  const { count: tierCount } = await supabase
    .from('subscription_tiers')
    .select('id', { count: 'exact', head: true })
    .in('class_node_id', toDelete);

  if (!input.cascade && (descendants.length > 0 || (tierCount ?? 0) > 0)) {
    const parts: string[] = [];
    if (descendants.length > 0) parts.push(`${descendants.length} descendant(s)`);
    if ((tierCount ?? 0) > 0) parts.push(`${tierCount} palier(s) d'abonnement rattaché(s)`);
    return {
      error: `Ce nœud a des dépendances (${parts.join(', ')}). Cochez « supprimer aussi le contenu lié » pour continuer.`,
    };
  }

  if ((tierCount ?? 0) > 0) {
    const { error: tierError } = await supabase.from('subscription_tiers').delete().in('class_node_id', toDelete);
    if (tierError) return { error: tierError.message };
  }

  const orderedForDeletion = toDelete.sort((a, b) => depthOf(rows, b) - depthOf(rows, a));

  for (const id of orderedForDeletion) {
    const { error } = await supabase.from('academic_nodes').delete().eq('id', id);
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
