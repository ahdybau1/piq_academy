'use client';

import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { AuthProvider, type AcademicCountry } from '@/lib/app-context';
import { WorkingClassProvider } from '@/lib/working-class-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import type { CurrentAdmin } from '@/lib/auth/current-admin';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18, ease: 'easeIn' } },
};

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname} variants={pageVariants} initial="initial" animate="enter" exit="exit" className="flex-1">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function ClientLayout({
  children,
  currentUser,
  availableCountries,
  selectedCountryId,
}: {
  children: React.ReactNode;
  currentUser: CurrentAdmin;
  availableCountries: AcademicCountry[];
  selectedCountryId: string | null;
}) {
  return (
    <AuthProvider currentUser={currentUser} availableCountries={availableCountries} selectedCountryId={selectedCountryId}>
      <WorkingClassProvider>
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex min-h-screen flex-col overflow-hidden">
              <Header />
              <main
                className="custom-scrollbar flex-1 overflow-y-auto px-4 py-5 lg:px-6 lg:py-6"
                style={{ background: 'var(--page-bg)' }}
              >
                <PageTransition>{children}</PageTransition>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </WorkingClassProvider>
    </AuthProvider>
  );
}
