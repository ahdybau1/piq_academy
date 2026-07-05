import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { TrashItemRow, TrashBatch } from './types';

export async function listTrashBatches(): Promise<TrashBatch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('trash_items')
    .select('batch_id, table_name, deleted_by, deleted_at')
    .is('restored_at', null)
    .order('deleted_at', { ascending: false });
  if (error) throw new Error(error.message);

  const byBatch = new Map<string, TrashBatch>();
  (data ?? []).forEach((row) => {
    const existing = byBatch.get(row.batch_id);
    if (existing) {
      existing.tableCounts[row.table_name] = (existing.tableCounts[row.table_name] ?? 0) + 1;
      existing.totalCount += 1;
    } else {
      byBatch.set(row.batch_id, {
        batch_id: row.batch_id,
        deleted_at: row.deleted_at,
        deleted_by: row.deleted_by,
        tableCounts: { [row.table_name]: 1 },
        totalCount: 1,
      });
    }
  });

  return Array.from(byBatch.values()).sort((a, b) => (a.deleted_at < b.deleted_at ? 1 : -1));
}

export async function listTrashItemsForBatch(batchId: string): Promise<TrashItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('trash_items')
    .select('id, batch_id, table_name, row_data, deleted_by, deleted_at, restored_at')
    .eq('batch_id', batchId)
    .is('restored_at', null);
  if (error) throw new Error(error.message);
  return data ?? [];
}
