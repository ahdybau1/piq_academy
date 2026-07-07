import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { ROLE_CONFIGS } from '@/lib/roles-config';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/current-admin';
import type { CurrentAdmin } from '@/lib/auth/current-admin';

export const SELECTED_COUNTRY_COOKIE = 'selected_country_id';

/**
 * Résout le pays qui doit réellement filtrer les données de l'admin courant.
 *
 * Règle : tout travail dans l'admin se fait dans le périmètre d'un pays précis,
 * sauf exception explicite. Les rôles à `countryScope: 'assigned'` (admin_pays)
 * n'ont aucun choix : leur pays vient de `admin_users.scope_json.countryId`,
 * jamais du cookie — un admin_pays ne peut pas se donner accès à un autre pays
 * en changeant un cookie. Les rôles à `countryScope: 'all'` (super_admin)
 * naviguent librement via le sélecteur (cookie), `null` = tous les pays.
 * Les rôles à `countryScope: 'none'` n'ont pas de notion de pays.
 */
export function resolveEffectiveCountryId(
  admin: Pick<CurrentAdmin, 'role' | 'assignedCountryId'>,
  cookieCountryId: string | null,
  availableCountryIds: string[]
): string | null {
  const scope = ROLE_CONFIGS[admin.role].countryScope;

  if (scope === 'none') return null;

  if (scope === 'assigned') {
    return admin.assignedCountryId;
  }

  // scope === 'all'
  if (cookieCountryId && availableCountryIds.includes(cookieCountryId)) {
    return cookieCountryId;
  }
  return null;
}

/** Lit le cookie de pays sélectionné côté serveur (Server Component / Server Action). */
export async function readSelectedCountryCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(SELECTED_COUNTRY_COOKIE)?.value ?? null;
}

export interface AcademicCountryOption {
  id: string;
  name: string;
}

/**
 * Résout la liste des pays et le pays effectif de l'admin courant pour la requête en
 * cours. Enveloppé dans `cache()` : le layout `(admin)` et chaque `page.tsx` réel
 * peuvent l'appeler indépendamment sans multiplier les allers-retours Supabase — React
 * dédoublonne automatiquement les appels identiques au sein d'un même rendu serveur.
 */
export const getResolvedCountry = cache(async (): Promise<{
  availableCountries: AcademicCountryOption[];
  selectedCountryId: string | null;
}> => {
  const admin = await requireAdmin();

  const supabase = await createClient();
  const { data: countries } = await supabase
    .from('academic_nodes')
    .select('id, name')
    .eq('node_type', 'pays')
    .eq('is_active', true)
    .order('display_order');

  const availableCountries = countries ?? [];
  const cookieCountryId = await readSelectedCountryCookie();
  const selectedCountryId = resolveEffectiveCountryId(
    admin,
    cookieCountryId,
    availableCountries.map((c) => c.id)
  );

  return { availableCountries, selectedCountryId };
});
