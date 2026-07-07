import type { SubscriptionTierRow } from './types';

/**
 * Seul point de contact entre le frontend et les données. Aucun appel Supabase ici —
 * uniquement des requêtes vers l'API interne (app/api/subscriptions/**).
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

export async function fetchSubscriptionTiers(countryId?: string): Promise<SubscriptionTierRow[]> {
  const qs = countryId ? `?countryId=${encodeURIComponent(countryId)}` : '';
  const res = await fetch(`/api/subscriptions/tiers${qs}`);
  if (!res.ok) throw new Error('Impossible de charger les paliers.');
  return res.json();
}

export function deleteSubscriptionTier(input: { id: string }) {
  return request(`/api/subscriptions/tiers/${input.id}`, { method: 'DELETE' });
}

export function setSubscriptionTierActive(input: { id: string; isActive: boolean }) {
  return request(`/api/subscriptions/tiers/${input.id}/status`, jsonInit('PATCH', { isActive: input.isActive }));
}
