'use server';

import { cookies } from 'next/headers';
import { SELECTED_COUNTRY_COOKIE } from '@/lib/country-scope';

/**
 * Persiste le pays choisi dans le sélecteur du header (super_admin uniquement —
 * les autres rôles n'ont pas de choix, voir resolveEffectiveCountryId).
 * `null` = "tous les pays".
 */
export async function setSelectedCountryCookie(countryId: string | null): Promise<void> {
  const store = await cookies();
  if (countryId) {
    store.set(SELECTED_COUNTRY_COOKIE, countryId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  } else {
    store.delete(SELECTED_COUNTRY_COOKIE);
  }
}
