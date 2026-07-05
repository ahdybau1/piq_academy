export interface TrashItemRow {
  id: string;
  batch_id: string;
  table_name: string;
  row_data: Record<string, unknown>;
  deleted_by: string | null;
  deleted_at: string;
  restored_at: string | null;
}

/** Un lot = tout ce qui a été supprimé en une seule action admin (ex: un nœud + son contenu). */
export interface TrashBatch {
  batch_id: string;
  deleted_at: string;
  deleted_by: string | null;
  tableCounts: Record<string, number>;
  totalCount: number;
}
