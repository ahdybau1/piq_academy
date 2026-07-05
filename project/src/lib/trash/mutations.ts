import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { TABLE_RESTORE_ORDER } from './constants';
import type { TrashItemRow } from './types';

export interface MutationResult {
  error?: string;
}

/**
 * Snapshote des lignes avant leur suppression réelle par l'appelant. Toujours via le
 * client admin (service_role) : la corbeille est un filet de sécurité interne, pas une
 * action que l'appelant doit avoir le droit d'écrire lui-même — seule la consultation/
 * restauration depuis l'écran Corbeille est réservée au Super-admin (RLS sur trash_items).
 * N'effectue AUCUNE suppression — l'appelant supprime les lignes juste après avoir appelé
 * cette fonction avec succès.
 */
export async function trashRows(input: {
  batchId: string;
  tableName: string;
  rows: Record<string, unknown>[];
  adminId: string | null;
}): Promise<MutationResult> {
  if (input.rows.length === 0) return {};
  const admin = createAdminClient();
  const { error } = await admin.from('trash_items').insert(
    input.rows.map((row) => ({
      batch_id: input.batchId,
      table_name: input.tableName,
      row_data: row,
      deleted_by: input.adminId,
    }))
  );
  if (error) return { error: error.message };
  return {};
}

/**
 * Réinsère toutes les lignes d'un lot dans leurs tables d'origine, dans un ordre qui
 * respecte les clés étrangères (academic_nodes d'abord, en tri topologique par parent_id
 * puisqu'auto-référencé ; puis les autres tables dans TABLE_RESTORE_ORDER).
 */
export async function restoreBatch(input: { batchId: string; adminId: string | null }): Promise<MutationResult> {
  const admin = createAdminClient();
  const { data: items, error } = await admin
    .from('trash_items')
    .select('id, batch_id, table_name, row_data, deleted_by, deleted_at, restored_at')
    .eq('batch_id', input.batchId)
    .is('restored_at', null);
  if (error) return { error: error.message };
  if (!items || items.length === 0) return { error: 'Rien à restaurer pour ce lot (déjà restauré ?).' };

  const byTable = new Map<string, TrashItemRow[]>();
  (items as TrashItemRow[]).forEach((item) => {
    byTable.set(item.table_name, [...(byTable.get(item.table_name) ?? []), item]);
  });

  const nodeItems = byTable.get('academic_nodes') ?? [];
  if (nodeItems.length > 0) {
    const insertedIds = new Set<string>();
    let pending = [...nodeItems];
    let guard = pending.length + 1;
    while (pending.length > 0 && guard > 0) {
      guard -= 1;
      const ready = pending.filter((item) => {
        const parentId = item.row_data.parent_id as string | null;
        return !parentId || insertedIds.has(parentId);
      });
      if (ready.length === 0) {
        return { error: "Impossible de restaurer l'arbre académique : un nœud parent est manquant ou déjà présent." };
      }
      const { error: insertError } = await admin.from('academic_nodes').insert(ready.map((r) => r.row_data));
      if (insertError) return { error: insertError.message };
      ready.forEach((r) => insertedIds.add(r.row_data.id as string));
      pending = pending.filter((item) => !ready.includes(item));
    }
  }

  for (const tableName of TABLE_RESTORE_ORDER) {
    const tableItems = byTable.get(tableName);
    if (!tableItems || tableItems.length === 0) continue;
    const { error: insertError } = await admin.from(tableName).insert(tableItems.map((r) => r.row_data));
    if (insertError) return { error: insertError.message };
  }

  const { error: markError } = await admin
    .from('trash_items')
    .update({ restored_at: new Date().toISOString() })
    .eq('batch_id', input.batchId);
  if (markError) return { error: markError.message };

  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'restore',
    entity_type: 'trash_items',
    entity_id: input.batchId,
    before_json: null,
    after_json: { restored_tables: Array.from(byTable.keys()) },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/** Purge définitive d'un lot : aucune restauration possible après ça. */
export async function purgeBatch(input: { batchId: string; adminId: string | null }): Promise<MutationResult> {
  const admin = createAdminClient();
  const { error } = await admin.from('trash_items').delete().eq('batch_id', input.batchId);
  if (error) return { error: error.message };

  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'purge',
    entity_type: 'trash_items',
    entity_id: input.batchId,
    before_json: null,
    after_json: null,
  });
  if (auditError) return { error: auditError.message };

  return {};
}
