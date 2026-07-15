import type { MediaItem } from './types';

export async function fetchMedia(classNodeId?: string): Promise<MediaItem[]> {
  const qs = classNodeId ? `?classNodeId=${encodeURIComponent(classNodeId)}` : '';
  const res = await fetch(`/api/media${qs}`);
  if (!res.ok) throw new Error('Impossible de charger la bibliothèque de médias.');
  return res.json();
}

export async function uploadMediaFile(file: File, classNodeId: string): Promise<MediaItem> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('classNodeId', classNodeId);
  const res = await fetch('/api/media', { method: 'POST', body: formData });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Échec de l'upload.");
  }
  return res.json();
}

export async function deleteMediaItem(id: string): Promise<{ error?: string }> {
  const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: data?.error ?? `Erreur inattendue (${res.status}).` };
  }
  return {};
}
