import type { TrashBatch } from './types';

interface ApiResult {
  error?: string;
}

async function request(url: string, init?: RequestInit): Promise<ApiResult> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: data?.error ?? `Erreur inattendue (${res.status}).` };
  }
  return {};
}

export async function fetchTrashBatches(): Promise<TrashBatch[]> {
  const res = await fetch('/api/trash');
  if (!res.ok) throw new Error('Impossible de charger la corbeille.');
  return res.json();
}

export function restoreTrashBatch(input: { batchId: string }) {
  return request(`/api/trash/${input.batchId}/restore`, { method: 'POST' });
}

export function purgeTrashBatch(input: { batchId: string }) {
  return request(`/api/trash/${input.batchId}`, { method: 'DELETE' });
}
