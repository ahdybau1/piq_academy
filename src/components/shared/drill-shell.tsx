'use client';

/**
 * Coquille animée de navigation en "drill-down" (liste -> détail -> sous-détail),
 * réutilisable sur les pages admin qui en ont besoin. Niveau 0 = liste/grille,
 * niveaux suivants = détail. Glissement depuis la droite en avant, depuis la
 * gauche en retour.
 */

import React from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ArrowLeft, ChevronRight, Hop as Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type NavDir = 'forward' | 'back';

export function slideVariants(dir: NavDir): Variants {
  return {
    initial: {
      x: dir === 'forward' ? 56 : -56,
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
    exit: {
      x: dir === 'forward' ? -56 : 56,
      opacity: 0,
      transition: { duration: 0.22, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] },
    },
  };
}

export const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card shadow-sm transition-all group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:shadow-md">
        <ArrowLeft className="h-4 w-4" />
      </div>
      <span>{label}</span>
    </button>
  );
}

export interface Crumb {
  label: string;
  onClick?: () => void;
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link href="/" className="flex items-center transition-colors hover:text-foreground">
        <Home className="h-3 w-3" />
      </Link>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="h-3 w-3 opacity-30" />
          {c.onClick ? (
            <button onClick={c.onClick} className="transition-colors hover:text-foreground">
              {c.label}
            </button>
          ) : (
            <span className="font-medium text-foreground/80">{c.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function LevelHeader({
  crumbs,
  title,
  subtitle,
  backLabel,
  onBack,
  actions,
}: {
  crumbs?: Crumb[];
  title: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 pb-6">
      {crumbs && <Breadcrumb crumbs={crumbs} />}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && backLabel && <BackButton label={backLabel} onClick={onBack} />}
          <div>
            <h1 className={cn('font-bold tracking-tight', onBack ? 'text-xl' : 'text-2xl')}>{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className="relative h-px w-full bg-border/40">
        <div className="brand-gradient-bg absolute left-0 top-0 h-px w-20 opacity-50" />
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/40">
        {icon}
      </div>
      <p className="text-base font-semibold text-foreground/70">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

export function LevelPane({
  levelKey,
  dir,
  children,
  className,
}: {
  levelKey: string;
  dir: NavDir;
  children: React.ReactNode;
  className?: string;
}) {
  const v = slideVariants(dir);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={levelKey} variants={v} initial="initial" animate="animate" exit="exit" className={cn('w-full', className)}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function RowItem({
  icon,
  iconColor,
  title,
  subtitle,
  badge,
  onClick,
  actions,
}: {
  icon?: React.ReactNode;
  iconColor?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div variants={listItem}>
      <div
        className={cn(
          'group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm',
          'transition-all duration-200 hover:border-primary/20 hover:shadow-md',
          onClick && 'cursor-pointer hover:-translate-y-0.5',
        )}
        onClick={onClick}
      >
        {icon && (
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm', iconColor ?? 'bg-primary')}>
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className={cn('truncate font-semibold text-foreground', onClick && 'transition-colors group-hover:text-primary')}>{title}</p>
          {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {badge}
        {onClick && !actions && (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary/60" />
        )}
        {actions && (
          <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}
