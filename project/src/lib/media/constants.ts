import type { MediaType } from './types';

/** Vérification taille/format des fichiers (section 2.7). */
export const ALLOWED_MIME_TYPES: Record<MediaType, string[]> = {
  image: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg'],
  pdf: ['application/pdf'],
  document: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
};

export const MAX_FILE_SIZE_BYTES: Record<MediaType, number> = {
  image: 10 * 1024 * 1024,
  video: 200 * 1024 * 1024,
  audio: 50 * 1024 * 1024,
  pdf: 30 * 1024 * 1024,
  document: 30 * 1024 * 1024,
};

export function mediaTypeFromMime(mime: string): MediaType | null {
  for (const [type, mimes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (mimes.includes(mime)) return type as MediaType;
  }
  return null;
}
