import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { MediaItem } from './types';

/** @param classNodeId Filtre optionnel — ne retourne que les médias d'une classe/série précise (section 2.7). */
export async function listMedia(classNodeId?: string): Promise<MediaItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from('media_library')
    .select('id, type, url, uploaded_by, class_node_id, created_at')
    .order('created_at', { ascending: false });
  if (classNodeId) query = query.eq('class_node_id', classNodeId);
  const { data: rows, error } = await query;
  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return [];

  const nodeIds = Array.from(new Set(rows.map((r) => r.class_node_id).filter((v): v is string => !!v)));
  let nameById = new Map<string, string>();
  if (nodeIds.length > 0) {
    const { data: nodes, error: nodesError } = await supabase.from('academic_nodes').select('id, name').in('id', nodeIds);
    if (nodesError) throw new Error(nodesError.message);
    nameById = new Map((nodes ?? []).map((n) => [n.id, n.name]));
  }

  return rows.map((r) => ({ ...r, className: r.class_node_id ? nameById.get(r.class_node_id) ?? null : null }));
}
