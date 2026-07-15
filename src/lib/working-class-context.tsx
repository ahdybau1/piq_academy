'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useApp } from './app-context';

interface WorkingClassContextType {
  /** Classe/série sélectionnée comme contexte de travail courant (section Académique) — préremplit
   * les sélecteurs de classe partout où l'admin en a besoin, pour éviter de la ressaisir à chaque écran. */
  workingClassNodeId: string | null;
  setWorkingClassNodeId: (id: string | null) => void;
}

const WorkingClassContext = createContext<WorkingClassContextType | null>(null);

function storageKey(countryId: string | null) {
  return `piq:workingClass:${countryId ?? 'none'}`;
}

export function WorkingClassProvider({ children }: { children: React.ReactNode }) {
  const { selectedCountry } = useApp();
  const countryId = selectedCountry?.id ?? null;
  const [workingClassNodeId, setWorkingClassNodeIdState] = useState<string | null>(null);

  // Les ids de classe sont propres à un pays — on recharge la sélection mémorisée
  // pour ce pays (ou on repart à vide) à chaque changement de périmètre.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setWorkingClassNodeIdState(window.localStorage.getItem(storageKey(countryId)) || null);
  }, [countryId]);

  const setWorkingClassNodeId = useCallback(
    (id: string | null) => {
      setWorkingClassNodeIdState(id);
      if (typeof window === 'undefined') return;
      if (id) window.localStorage.setItem(storageKey(countryId), id);
      else window.localStorage.removeItem(storageKey(countryId));
    },
    [countryId]
  );

  return (
    <WorkingClassContext.Provider value={{ workingClassNodeId, setWorkingClassNodeId }}>
      {children}
    </WorkingClassContext.Provider>
  );
}

export function useWorkingClass() {
  const context = useContext(WorkingClassContext);
  if (!context) {
    throw new Error('useWorkingClass must be used within a WorkingClassProvider');
  }
  return context;
}
