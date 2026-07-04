'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
  switchCountry: (countryId: string | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AuthProvider({
  children,
  currentUser,
  availableCountries,
}: {
  children: React.ReactNode;
  currentUser: CurrentAdmin;
  availableCountries: AcademicCountry[];
}) {
  const router = useRouter();
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    availableCountries[0]?.id ?? null
  );

  const switchCountry = useCallback((countryId: string | null) => {
    setSelectedCountryId(countryId);
  }, []);

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

  const selectedCountry = availableCountries.find((c) => c.id === selectedCountryId) ?? null;

  return (
    <AppContext.Provider
      value={{
        currentUser: displayUser,
        selectedCountry,
        availableCountries,
        switchCountry,
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
