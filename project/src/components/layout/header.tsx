'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/lib/app-context';
import { ROLE_COLORS, ROLE_LABELS } from '@/lib/roles-config';
import {
  Bell,
  ChevronDown,
  Globe,
  LogOut,
  Settings,
  User,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';

export function Header() {
  const { currentUser, selectedCountry, availableCountries, switchCountry, logout } = useApp();

  const initials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 flex h-14 animate-in items-center gap-3 border-b bg-background/80 px-4 fade-in slide-in-from-top-2 backdrop-blur-md duration-500 supports-backdrop-filter:bg-background/60 lg:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="brand-gradient-bg relative flex h-8 w-8 items-center justify-center rounded-lg p-1 shadow-sm">
          <Image src="/logo-mark.png" alt="PIQ" width={671} height={470} className="h-full w-full object-contain" priority />
        </div>
        <span className="hidden font-semibold text-foreground lg:inline-block">ACADEMY</span>
      </div>

      <div className="flex-1" />

      {/* Country Selector */}
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedCountry?.id || ''} onValueChange={switchCountry}>
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder="Pays" />
          </SelectTrigger>
          <SelectContent>
            {availableCountries.map((country) => (
              <SelectItem key={country.id} value={country.id}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ThemeToggle />

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative h-8 w-8">
        <Bell className="h-4 w-4" />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
          <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            3
          </span>
        </span>
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 items-center gap-2 rounded-md px-2 transition-colors hover:bg-muted">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start lg:flex">
            <span className="text-sm font-medium leading-none">{currentUser.name}</span>
            <Badge
              variant="outline"
              className={cn(
                'mt-0.5 px-1.5 py-0 text-[10px] leading-none border',
                ROLE_COLORS[currentUser.role]
              )}
            >
              {ROLE_LABELS[currentUser.role]}
            </Badge>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{currentUser.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
              <Badge
                variant="outline"
                className={cn(
                  'mt-1 w-fit px-1.5 py-0.5 text-[10px] border',
                  ROLE_COLORS[currentUser.role]
                )}
              >
                {ROLE_LABELS[currentUser.role]}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Mon profil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
