import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { MediaRow } from './types';

export async function listMedia(): Promise<MediaRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('media_library')
    .select('id, type, url, uploaded_by, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
