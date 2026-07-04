'use client';

import React from 'react';
import Image from 'next/image';
import { SidebarNav } from './sidebar-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useApp } from '@/lib/app-context';
import { ROLE_LABELS } from '@/lib/roles-config';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ROLE_COLORS } from '@/lib/roles-config';

export function AppSidebar() {
  const { currentUser } = useApp();

  return (
    <Sidebar className="animate-in border-r border-sidebar-border fade-in slide-in-from-left-4 duration-500" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="brand-gradient-bg relative flex h-10 w-10 items-center justify-center rounded-lg p-1.5 shadow-sm transition-transform duration-300 hover:scale-105">
            <Image src="/logo-mark.png" alt="PIQ" width={671} height={470} className="h-full w-full object-contain" priority />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white">ACADEMY</span>
            <span className="text-[10px] text-sidebar-foreground/60 tracking-wider">LEARN - GROW - ACHIEVE</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between text-xs text-sidebar-foreground/50">
          <span>Version 1.0.0</span>
          <Badge
            variant="outline"
            className={cn('text-[10px] border-sidebar-border', ROLE_COLORS[currentUser.role])}
          >
            {ROLE_LABELS[currentUser.role]}
          </Badge>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
