import type { AuditLogEntry } from '@/lib/academic/types';
import type { AccountDetail } from './types';

/**
 * Seul point de contact entre le frontend (composants client) et les données.
 * Aucun appel Supabase ici — uniquement des requêtes vers l'API interne
 * (app/api/accounts/**, app/api/profiles/**). La logique et l'autorisation
 * vivent côté serveur.
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

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// --- Comptes (5.1) ---

export function createAccount(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string;
}) {
  return request('/api/accounts', jsonInit('POST', input));
}

export function updateAccount(input: {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email?: string;
}) {
  return request(`/api/accounts/${input.id}`, jsonInit('PATCH', input));
}

export function setAccountStatus(input: { id: string; status: 'actif' | 'suspendu' }) {
  return request(`/api/accounts/${input.id}/status`, jsonInit('PATCH', { status: input.status }));
}

export function deleteAccount(input: { id: string }) {
  return request(`/api/accounts/${input.id}`, { method: 'DELETE' });
}

export function forceLogout(input: { id: string }) {
  return request(`/api/accounts/${input.id}/force-logout`, { method: 'POST' });
}

export function resetPassword(input: { id: string }) {
  return request(`/api/accounts/${input.id}/reset-password`, { method: 'POST' });
}

export async function fetchAccountDetail(id: string): Promise<AccountDetail> {
  const res = await fetch(`/api/accounts/${id}`);
  if (!res.ok) throw new Error('Impossible de charger le détail du compte.');
  return res.json();
}

export async function fetchAccountHistory(id: string): Promise<AuditLogEntry[]> {
  const res = await fetch(`/api/accounts/${id}/history`);
  if (!res.ok) throw new Error("Impossible de charger l'historique.");
  return res.json();
}

// --- Profils (5.2) ---

export function updateProfile(input: { id: string; classNodeId: string; schoolYear: string }) {
  return request(
    `/api/profiles/${input.id}`,
    jsonInit('PATCH', { classNodeId: input.classNodeId, schoolYear: input.schoolYear })
  );
}

export function setProfileStatus(input: { id: string; status: 'actif' | 'archivé' }) {
  return request(`/api/profiles/${input.id}/status`, jsonInit('PATCH', { status: input.status }));
}

export function deleteProfile(input: { id: string }) {
  return request(`/api/profiles/${input.id}`, { method: 'DELETE' });
}

export function transferProfile(input: { id: string; newAccountId: string }) {
  return request(`/api/profiles/${input.id}/transfer`, jsonInit('PATCH', { newAccountId: input.newAccountId }));
}

export async function fetchProfileHistory(id: string): Promise<AuditLogEntry[]> {
  const res = await fetch(`/api/profiles/${id}/history`);
  if (!res.ok) throw new Error("Impossible de charger l'historique.");
  return res.json();
}
