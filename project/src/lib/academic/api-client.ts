import type { AcademicNodeType, AcademicNodeDependencies, AcademicNodeRow, AuditLogEntry, CountrySettingsRow } from './types';

/**
 * Seul point de contact entre le frontend (composants client) et les données.
 * Aucun appel Supabase ici — uniquement des requêtes vers l'API interne
 * (app/api/academic/nodes/**). La logique et l'autorisation vivent côté serveur.
 */

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

export async function fetchAcademicNodes(countryId?: string): Promise<AcademicNodeRow[]> {
  const qs = countryId ? `?countryId=${encodeURIComponent(countryId)}` : '';
  const res = await fetch(`/api/academic/nodes${qs}`);
  if (!res.ok) throw new Error("Impossible de charger l'arbre académique.");
  return res.json();
}

export function createNode(input: { nodeType: AcademicNodeType; name: string; parentId: string | null }) {
  return request('/api/academic/nodes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function updateNode(input: { id: string; name: string }) {
  return request(`/api/academic/nodes/${input.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: input.name }),
  });
}

export function setNodeActive(input: { id: string; isActive: boolean }) {
  return request(`/api/academic/nodes/${input.id}/active`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive: input.isActive }),
  });
}

export function moveNode(input: { id: string; newParentId: string | null }) {
  return request(`/api/academic/nodes/${input.id}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newParentId: input.newParentId }),
  });
}

export function duplicateNode(input: { id: string }) {
  return request(`/api/academic/nodes/${input.id}/duplicate`, { method: 'POST' });
}

export function deleteNode(input: { id: string; cascade: boolean }) {
  return request(`/api/academic/nodes/${input.id}?cascade=${input.cascade}`, { method: 'DELETE' });
}

/** Fusionne deux classes en une seule : migre les profils élève de `id` vers `targetId`, puis supprime `id` (section 1.4). */
export function mergeNode(input: { id: string; targetId: string }) {
  return request(`/api/academic/nodes/${input.id}/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetId: input.targetId }),
  });
}

export async function fetchDependencies(nodeId: string): Promise<AcademicNodeDependencies> {
  const res = await fetch(`/api/academic/nodes/${nodeId}/dependencies`);
  if (!res.ok) throw new Error('Impossible de charger les dépendances.');
  return res.json();
}

export async function fetchHistory(nodeId: string): Promise<AuditLogEntry[]> {
  const res = await fetch(`/api/academic/nodes/${nodeId}/history`);
  if (!res.ok) throw new Error("Impossible de charger l'historique.");
  return res.json();
}

/** Paramètres d'un pays (section 1.1) — `null` tant qu'aucune valeur n'a jamais été enregistrée. */
export async function fetchCountrySettings(countryId: string): Promise<CountrySettingsRow | null> {
  const res = await fetch(`/api/academic/nodes/${countryId}/settings`);
  if (!res.ok) throw new Error('Impossible de charger les paramètres du pays.');
  return res.json();
}

export function upsertCountrySettings(input: {
  countryId: string;
  officialLanguages: string[];
  currency: string | null;
  schoolYearStartDate: string | null;
  schoolYearEndDate: string | null;
}) {
  return request(`/api/academic/nodes/${input.countryId}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      officialLanguages: input.officialLanguages,
      currency: input.currency,
      schoolYearStartDate: input.schoolYearStartDate,
      schoolYearEndDate: input.schoolYearEndDate,
    }),
  });
}
