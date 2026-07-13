import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { trashRows } from '@/lib/trash/mutations';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, mediaTypeFromMime } from './constants';
import type { MediaItem } from './types';

export interface MediaMutationResult {
  error?: string;
  media?: MediaItem;
}

export interface MutationResult {
  error?: string;
}

const MEDIA_BUCKET = 'media';

/**
 * Upload un fichier dans le bucket Storage `media` puis enregistre la référence dans
 * `media_library`. Vérifie le format (whitelist par type) et la taille avant l'upload
 * (section 2.7 : "vérification taille/format des fichiers"). `classNodeId` est obligatoire
 * — un média est toujours rattaché à une classe/série précise (règle métier confirmée).
 */
export async function uploadMedia(input: { file: File; classNodeId: string; adminId: string | null }): Promise<MediaMutationResult> {
  const { file } = input;
  if (!input.classNodeId) return { error: 'La classe/série est requise.' };

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
  if (uploadError) {
    console.error('[uploadMedia] Supabase Storage upload failed:', uploadError);
    return { error: `Échec de l'upload Storage : ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  const { data: media, error: insertError } = await supabase
    .from('media_library')
    .insert({ type, url: publicUrl, uploaded_by: input.adminId, class_node_id: input.classNodeId })
    .select('id, type, url, uploaded_by, class_node_id, created_at')
    .single();
  if (insertError) return { error: insertError.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'media_library',
    entity_id: media.id,
    before_json: null,
    after_json: { type, url: publicUrl, class_node_id: input.classNodeId },
  });
  if (auditError) return { error: auditError.message };

  return { media: { ...media, className: null } };
}

/** Suppression réversible (corbeille) — ne purge pas le fichier Storage, cohérent avec le reste de l'application. */
export async function deleteMedia(input: { id: string; adminId: string | null }): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: before, error: beforeError } = await supabase.from('media_library').select('*').eq('id', input.id).maybeSingle();
  if (beforeError) return { error: beforeError.message };
  if (!before) return { error: 'Média introuvable.' };

  const trashResult = await trashRows({
    batchId: crypto.randomUUID(),
    tableName: 'media_library',
    rows: [before as Record<string, unknown>],
    adminId: input.adminId,
  });
  if (trashResult.error) return trashResult;

  const { error } = await supabase.from('media_library').delete().eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'delete',
    entity_type: 'media_library',
    entity_id: input.id,
    before_json: before,
    after_json: null,
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export { ALLOWED_MIME_TYPES };
