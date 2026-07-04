'use client';

import React from 'react';
import { AuthProvider, type AcademicCountry } from '@/lib/app-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import type { CurrentAdmin } from '@/lib/auth/current-admin';

export function ClientLayout({
  children,
  currentUser,
  availableCountries,
}: {
  children: React.ReactNode;
  currentUser: CurrentAdmin;
  availableCountries: AcademicCountry[];
}) {
  return (
    <AuthProvider currentUser={currentUser} availableCountries={availableCountries}>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 overflow-auto bg-slate-50/50 p-4 lg:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </AuthProvider>
  );
}
