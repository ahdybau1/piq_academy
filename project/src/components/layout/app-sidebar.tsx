'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { SidebarNav } from './sidebar-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useApp } from '@/lib/app-context';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles-config';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { currentUser } = useApp();

  return (
    <Sidebar className="border-r border-sidebar-border" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border/70 px-4 py-3.5">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="relative">
            <div className="brand-gradient-bg flex h-9 w-9 items-center justify-center rounded-lg p-1.5 shadow-[0_2px_12px_-2px] shadow-blue-500/40">
              <Image src="/logo-mark.png" alt="PIQ" width={671} height={470} className="h-full w-full object-contain" priority />
            </div>
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-emerald-400 shadow-sm" />
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="text-[15px] font-bold leading-none tracking-wide text-white">
              PIQ ACADEMY
            </span>
            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/40">
              Administration
            </span>
          </div>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar overflow-y-auto">
        <SidebarNav />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        <motion.div
          className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-[10px] font-bold text-sidebar-foreground">
              {(currentUser.name ?? '?').charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-xs font-medium text-sidebar-foreground/60">
              {currentUser.name}
            </span>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-md border border-sidebar-border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider opacity-70',
              ROLE_COLORS[currentUser.role],
            )}
          >
            {ROLE_LABELS[currentUser.role]}
          </span>
        </motion.div>

        <div className="mt-1.5 flex items-center justify-center">
          <span className="tabular text-[9px] text-sidebar-foreground/20">v1.0.0</span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
