import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, mediaTypeFromMime } from './constants';
import type { MediaRow } from './types';

export interface MediaMutationResult {
  error?: string;
  media?: MediaRow;
}

const MEDIA_BUCKET = 'media';

/**
 * Upload un fichier dans le bucket Storage `media` puis enregistre la référence dans
 * `media_library`. Vérifie le format (whitelist par type) et la taille avant l'upload
 * (section 2.7 : "vérification taille/format des fichiers").
 */
export async function uploadMedia(input: { file: File; adminId: string | null }): Promise<MediaMutationResult> {
  const { file } = input;
  const type = mediaTypeFromMime(file.type);
  if (!type) return { error: `Format de fichier non autorisé : ${file.type || 'inconnu'}.` };

  const maxSize = MAX_FILE_SIZE_BYTES[type];
  if (file.size > maxSize) {
    return { error: `Fichier trop volumineux (max ${Math.round(maxSize / (1024 * 1024))} Mo pour ce type).` };
  }

  const supabase = await createClient();

  const extension = file.name.split('.').pop() ?? 'bin';
  const path = `${type}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  const { data: media, error: insertError } = await supabase
    .from('media_library')
    .insert({ type, url: publicUrl, uploaded_by: input.adminId })
    .select('id, type, url, uploaded_by, created_at')
    .single();
  if (insertError) return { error: insertError.message };

  return { media };
}

export { ALLOWED_MIME_TYPES };
