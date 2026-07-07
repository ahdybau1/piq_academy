import type { MediaRow } from './types';

export async function fetchMedia(): Promise<MediaRow[]> {
  const res = await fetch('/api/media');
  if (!res.ok) throw new Error('Impossible de charger la bibliothèque de médias.');
  return res.json();
}

export async function uploadMediaFile(file: File): Promise<MediaRow> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/media', { method: 'POST', body: formData });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Échec de l'upload.");
  }
  return res.json();
}
