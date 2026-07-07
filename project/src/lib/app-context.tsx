'use client';

import React, { createContext, useContext, useCallback, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { setSelectedCountryCookie } from '@/lib/country-scope-actions';
import { ROLE_CONFIGS } from '@/lib/roles-config';
import type { UserRole } from './types';
import type { CurrentAdmin } from './auth/current-admin';

export interface AcademicCountry {
  id: string;
  name: string;
}

interface DisplayUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AppContextType {
  currentUser: DisplayUser;
  selectedCountry: AcademicCountry | null;
  availableCountries: AcademicCountry[];
  /** true si le rôle courant n'a pas le choix (pays assigné) — le picker doit être en lecture seule. */
  isCountryLocked: boolean;
  switchCountry: (countryId: string | null) => void;
  isSwitchingCountry: boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AuthProvider({
  children,
  currentUser,
  availableCountries,
  selectedCountryId,
}: {
  children: React.ReactNode;
  currentUser: CurrentAdmin;
  availableCountries: AcademicCountry[];
  /** Résolu côté serveur (cookie pour super_admin, pays assigné pour admin_pays, null sinon). */
  selectedCountryId: string | null;
}) {
  const router = useRouter();
  const [isSwitchingCountry, startCountryTransition] = useTransition();

  // Le pays sélectionné est piloté par le serveur (cookie via server action, ou
  // assignation pays pour admin_pays) : pas d'état local dupliqué — la seule source
  // de vérité est le cookie + `resolveEffectiveCountryId`, relu à chaque `router.refresh()`.
  const switchCountry = useCallback(
    (countryId: string | null) => {
      startCountryTransition(async () => {
        await setSelectedCountryCookie(countryId);
        router.refresh();
      });
    },
    [router]
  );

  const logout = useCallback(() => {
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      router.push('/login');
      router.refresh();
    });
  }, [router]);

  const displayUser: DisplayUser = useMemo(
    () => ({
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.email.split('@')[0],
      role: currentUser.role,
    }),
    [currentUser]
  );

  const isCountryLocked = ROLE_CONFIGS[currentUser.role].countryScope === 'assigned';
  const selectedCountry = availableCountries.find((c) => c.id === selectedCountryId) ?? null;

  return (
    <AppContext.Provider
      value={{
        currentUser: displayUser,
        selectedCountry,
        availableCountries,
        isCountryLocked,
        switchCountry,
        isSwitchingCountry,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AuthProvider');
  }
  return context;
}
