import type { EstablishmentRow, EstablishmentPaperItem, EstablishmentTeacherItem } from './types';

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

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export async function fetchEstablishments(countryId?: string): Promise<EstablishmentRow[]> {
  const qs = countryId ? `?countryId=${encodeURIComponent(countryId)}` : '';
  const res = await fetch(`/api/establishments${qs}`);
  if (!res.ok) throw new Error('Impossible de charger les établissements.');
  return res.json();
}

export function createEstablishment(input: { countryId: string; name: string; city: string | null }) {
  return request('/api/establishments', jsonInit('POST', input));
}

export function updateEstablishment(input: { id: string; name: string; city: string | null; isActive: boolean }) {
  return request(`/api/establishments/${input.id}`, jsonInit('PATCH', input));
}

export async function fetchEstablishmentPapers(establishmentId: string): Promise<EstablishmentPaperItem[]> {
  const res = await fetch(`/api/establishments/${establishmentId}/papers`);
  if (!res.ok) throw new Error('Impossible de charger les épreuves.');
  return res.json();
}

export function createEstablishmentPaper(input: {
  establishmentId: string;
  classNodeId: string;
  subjectId: string;
  year: number;
  documentUrl: string | null;
  correctionUrl: string | null;
}) {
  return request(`/api/establishments/${input.establishmentId}/papers`, jsonInit('POST', input));
}

export function updateEstablishmentPaper(input: {
  id: string;
  classNodeId: string;
  subjectId: string;
  year: number;
  documentUrl: string | null;
  correctionUrl: string | null;
}) {
  return request(`/api/establishments/papers/${input.id}`, jsonInit('PATCH', input));
}

export function deleteEstablishmentPaper(input: { id: string }) {
  return request(`/api/establishments/papers/${input.id}`, { method: 'DELETE' });
}

export function submitEstablishmentPaperForValidation(input: { paperId: string }) {
  return request(`/api/establishments/papers/${input.paperId}/submit`, { method: 'POST' });
}

export async function uploadEstablishmentDocument(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/establishments/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Échec de l'upload.");
  }
  return res.json();
}

export async function fetchEstablishmentTeachers(establishmentId: string): Promise<EstablishmentTeacherItem[]> {
  const res = await fetch(`/api/establishments/${establishmentId}/teachers`);
  if (!res.ok) throw new Error('Impossible de charger les enseignants.');
  return res.json();
}
