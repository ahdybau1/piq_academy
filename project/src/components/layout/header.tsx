'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/app-context';
import { useWorkingClass } from '@/lib/working-class-context';
import { fetchAcademicNodes } from '@/lib/academic/api-client';
import type { AcademicNodeRow } from '@/lib/academic/types';
import { HierarchicalNodeSelect } from '@/components/academic/hierarchical-node-select';
import { ROLE_COLORS, ROLE_LABELS, ROLE_CONFIGS } from '@/lib/roles-config';
import { Bell, ChevronDown, Globe, LayoutGrid, LogOut, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const NOTIFICATION_COUNT = 3;

/** Sélecteur de pays — masqué pour les rôles dont le périmètre n'est pas géographique. */
function CountrySelector() {
  const { currentUser, selectedCountry, availableCountries, isCountryLocked, switchCountry, isSwitchingCountry } = useApp();
  const roleConfig = ROLE_CONFIGS[currentUser.role];

  if (roleConfig.countryScope === 'none') return null;
  if (availableCountries.length === 0 && !isCountryLocked) return null;

  // Rôle à pays assigné (ex. admin_pays) : aucun choix possible, on affiche juste
  // le pays assigné en lecture seule — le sélecteur ne doit pas laisser croire
  // qu'il peut changer de périmètre.
  if (isCountryLocked) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 lg:block">
          Périmètre
        </span>
        <span className="flex h-9 w-fit items-center gap-2.5 rounded-full bg-primary/8 px-3.5 text-sm font-semibold text-primary">
          <Globe className="h-3.5 w-3.5 shrink-0 opacity-70" />
          {selectedCountry?.name ?? 'Aucun pays assigné'}
        </span>
      </div>
    );
  }

  const isGlobal = roleConfig.countryScope === 'all';
  const currentValue = selectedCountry?.id ?? 'all';

  // Base UI's <Select.Value> affiche la valeur brute (l'id) sauf si on lui fournit
  // explicitement la correspondance valeur -> libellé via `items` sur `Select.Root`.
  const selectItems: Record<string, React.ReactNode> = {
    ...(isGlobal ? { all: 'Tous les pays' } : {}),
    ...Object.fromEntries(availableCountries.map((c) => [c.id, c.name])),
  };

  function handleChange(value: string | null) {
    switchCountry(value === 'all' || value === null ? null : value);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 lg:block">
        Périmètre
      </span>

      <Select items={selectItems} value={currentValue} onValueChange={handleChange} disabled={isSwitchingCountry}>
        <SelectTrigger
          className={cn(
            'h-9 w-fit gap-2.5 rounded-full px-3.5 text-sm font-semibold',
            'border-none shadow-none ring-0 focus:ring-0',
            'transition-colors',
            isSwitchingCountry && 'opacity-60',
            selectedCountry
              ? 'bg-primary/8 text-primary hover:bg-primary/12'
              : 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/15 dark:text-cyan-400',
          )}
        >
          <Globe className="h-3.5 w-3.5 shrink-0 opacity-70" />
          <SelectValue placeholder="Sélectionner un pays" />
        </SelectTrigger>

        <SelectContent className="rounded-xl border-border/40 shadow-xl">
          {isGlobal && (
            <SelectItem
              value="all"
              className="px-3 py-2.5 text-sm font-semibold text-cyan-600 focus:text-cyan-600 dark:text-cyan-400"
            >
              Tous les pays
            </SelectItem>
          )}

          {availableCountries.map((country) => (
            <SelectItem key={country.id} value={country.id} className="px-3 py-2.5 text-sm font-medium">
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Sélecteur de « classe/série de travail » — visible uniquement dans la section Académique.
 * Préremplit les sélecteurs de classe des écrans (Contenu, Catalogue, Médias, Épreuves
 * d'établissement) pour éviter de reparcourir la cascade Section→Enseignement→Cycle→Classe→Série
 * à chaque formulaire quand l'admin travaille sur une même classe pendant un moment.
 */
function WorkingClassSelector() {
  const pathname = usePathname();
  const { selectedCountry } = useApp();
  const { workingClassNodeId, setWorkingClassNodeId } = useWorkingClass();
  const [nodes, setNodes] = useState<AcademicNodeRow[] | null>(null);

  useEffect(() => {
    if (!selectedCountry) {
      setNodes(null);
      return;
    }
    fetchAcademicNodes(selectedCountry.id)
      .then(setNodes)
      .catch(() => setNodes(null));
  }, [selectedCountry]);

  if (!pathname.startsWith('/academic') || !selectedCountry) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 lg:flex">
        <LayoutGrid className="h-3 w-3" />
        Classe de travail
      </span>
      <HierarchicalNodeSelect
        nodes={nodes ?? []}
        countryId={selectedCountry.id}
        value={workingClassNodeId ?? ''}
        onChange={(id) => setWorkingClassNodeId(id || null)}
        compact
      />
      {workingClassNodeId && (
        <button
          onClick={() => setWorkingClassNodeId(null)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}

export function Header() {
  const { currentUser, logout } = useApp();

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.header
      className="sticky top-0 z-50 flex h-13 items-center gap-3 border-b border-border/60 bg-background/90 px-3 backdrop-blur-md lg:px-5"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <SidebarTrigger className="-ml-1 shrink-0 text-muted-foreground hover:text-foreground" />

      <div className="flex flex-1 items-center gap-4">
        <CountrySelector />
        <WorkingClassSelector />
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {NOTIFICATION_COUNT > 0 && (
            <>
              <motion.span
                className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-red-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.6 }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                  {NOTIFICATION_COUNT}
                </span>
              </motion.span>
              <motion.span
                className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-red-500/60"
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
            </>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 items-center gap-2 rounded-lg px-2 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-7 w-7 ring-1 ring-border/60">
              <AvatarFallback className="brand-gradient-bg text-[11px] font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start lg:flex">
              <span className="text-sm font-medium leading-none">{currentUser.name}</span>
              <Badge
                variant="outline"
                className={cn(
                  'mt-0.5 h-3.5 border-border/60 px-1 py-0 text-[9px] leading-none',
                  ROLE_COLORS[currentUser.role],
                )}
              >
                {ROLE_LABELS[currentUser.role]}
              </Badge>
            </div>
            <ChevronDown className="hidden h-3 w-3 text-muted-foreground/60 lg:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 shadow-lg">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                <Badge
                  variant="outline"
                  className={cn('mt-1 w-fit border-border/60 px-1.5 py-0.5 text-[10px]', ROLE_COLORS[currentUser.role])}
                >
                  {ROLE_LABELS[currentUser.role]}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
