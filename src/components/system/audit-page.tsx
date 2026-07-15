'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Shield, Search, Clock, ChevronRight, ArrowLeft, Download } from 'lucide-react';
import { ACTION_TYPE_LABELS, ENTITY_TYPE_LABELS } from '@/lib/audit/constants';
import type { AuditLogItem } from '@/lib/audit/types';
import { ROLE_COLORS, ROLE_LABELS } from '@/lib/roles-config';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

const ACTION_COLOR: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  activate: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  deactivate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  submit: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approve: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  request_correction: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  reject: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  restore: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  purge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  move: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
};

const ALL_ROLES: UserRole[] = ['super_admin', 'admin_pays', 'admin_contenu', 'enseignant', 'moderateur', 'support', 'traducteur', 'validateur'];

const ROLE_FILTER_ITEMS: Record<string, React.ReactNode> = {
  all: 'Tous rôles',
  ...Object.fromEntries(ALL_ROLES.map((r) => [r, ROLE_LABELS[r]])),
};

const ACTION_FILTER_ITEMS: Record<string, React.ReactNode> = {
  all: 'Toutes actions',
  ...ACTION_TYPE_LABELS,
};

type Dir = 'forward' | 'back';
function slide(dir: Dir): Variants {
  return {
    initial: { x: dir === 'forward' ? 64 : -64, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { x: dir === 'forward' ? -64 : 64, opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] } },
  };
}
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } } };
const rowItem: Variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

/** Section 13.5 : "Export de l'audit log" — CSV généré côté client à partir des entrées déjà filtrées, sans aller-retour serveur. */
function exportToCsv(entries: AuditLogItem[]) {
  const header = ['Date', 'Administrateur', 'Rôle', 'Action', "Type d'entité", 'Élément concerné', 'ID entité'];
  const rows = entries.map((e) => [
    e.created_at ? new Date(e.created_at).toLocaleString('fr-FR') : '',
    e.adminEmail ?? 'Système',
    e.adminRole ? ROLE_LABELS[e.adminRole as UserRole] ?? e.adminRole : '',
    ACTION_TYPE_LABELS[e.action_type] ?? e.action_type,
    ENTITY_TYPE_LABELS[e.entity_type] ?? e.entity_type,
    e.entityLabel,
    e.entity_id,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `journal-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AuditLogPageView({ initialEntries }: { initialEntries: AuditLogItem[] }) {
  const [selectedEntry, setSelectedEntry] = useState<AuditLogItem | null>(null);
  const [dir, setDir] = useState<Dir>('forward');
  const [userFilter, setUserFilter] = useState<string | null>('all');
  const [actionFilter, setActionFilter] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = initialEntries.filter((entry) => {
    if (userFilter !== 'all' && entry.adminRole !== userFilter) return false;
    if (actionFilter !== 'all' && entry.action_type !== actionFilter) return false;
    if (
      searchQuery &&
      !(entry.adminEmail ?? '').toLowerCase().includes(searchQuery.toLowerCase()) &&
      !entry.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !entry.entityLabel.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const open = (entry: AuditLogItem) => { setDir('forward'); setSelectedEntry(entry); };
  const close = () => { setDir('back'); setSelectedEntry(null); };

  const ListLevel = (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'audit"
        description="Historique des actions administratives"
        breadcrumbs={[
          { label: 'Système' },
          { label: "Journal d'audit" },
        ]}
        actions={
          <Button variant="outline" onClick={() => exportToCsv(filteredEntries)} disabled={filteredEntries.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            className="pl-9"
            placeholder="Administrateur, type, élément…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select items={ROLE_FILTER_ITEMS} value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous rôles</SelectItem>
            {ALL_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select items={ACTION_FILTER_ITEMS} value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes actions</SelectItem>
            {Object.entries(ACTION_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filteredEntries.length} entrée(s)</span>
      </div>

      <motion.div className="space-y-2" variants={stagger} initial="hidden" animate="show">
        {filteredEntries.map((entry) => (
          <motion.button
            key={entry.id}
            variants={rowItem}
            onClick={() => open(entry)}
            className="group w-full rounded-2xl border border-border/40 bg-card px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8">
                <Shield className="h-5 w-5 text-primary/70" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {entry.adminEmail ?? 'Système'}
                  </p>
                  {entry.adminRole && (
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', ROLE_COLORS[entry.adminRole as UserRole])}>
                      {ROLE_LABELS[entry.adminRole as UserRole] ?? entry.adminRole}
                    </span>
                  )}
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', ACTION_COLOR[entry.action_type] ?? 'bg-muted text-muted-foreground')}>
                    {ACTION_TYPE_LABELS[entry.action_type] ?? entry.action_type}
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {entry.created_at ? new Date(entry.created_at).toLocaleString('fr-FR') : '—'}
                  <span className="mx-1 opacity-30">·</span>
                  {ENTITY_TYPE_LABELS[entry.entity_type] ?? entry.entity_type}
                  <span className="opacity-70">« {entry.entityLabel} »</span>
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-primary/50" />
            </div>
          </motion.button>
        ))}
        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
            <Search className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Aucune entrée correspondante</p>
          </div>
        )}
      </motion.div>
    </div>
  );

  const DetailLevel = selectedEntry && (
    <div className="space-y-6">
      <div className="space-y-3">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <button className="transition-colors hover:text-foreground" onClick={close}>Journal d&apos;audit</button>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="max-w-[200px] truncate font-medium text-foreground/80">{selectedEntry.adminEmail ?? 'Système'}</span>
        </nav>
        <div className="flex items-start gap-3">
          <button
            onClick={close}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Détails de l&apos;action</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {selectedEntry.created_at ? new Date(selectedEntry.created_at).toLocaleString('fr-FR') : '—'}
            </p>
          </div>
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      {(selectedEntry.before_json || selectedEntry.after_json) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {selectedEntry.before_json && (
            <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
              <Label className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                Ancienne valeur
              </Label>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                {JSON.stringify(selectedEntry.before_json, null, 2)}
              </pre>
            </div>
          )}
          {selectedEntry.after_json && (
            <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
              <Label className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                Nouvelle valeur
              </Label>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                {JSON.stringify(selectedEntry.after_json, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
        <dl className="space-y-3 text-sm">
          {[
            { label: 'Administrateur', value: selectedEntry.adminEmail ?? 'Système' },
            {
              label: 'Rôle',
              value: selectedEntry.adminRole ? ROLE_LABELS[selectedEntry.adminRole as UserRole] ?? selectedEntry.adminRole : '—',
              badge: selectedEntry.adminRole ? ROLE_COLORS[selectedEntry.adminRole as UserRole] : undefined,
            },
            {
              label: 'Action',
              value: ACTION_TYPE_LABELS[selectedEntry.action_type] ?? selectedEntry.action_type,
              badge: ACTION_COLOR[selectedEntry.action_type],
            },
            { label: "Type d'entité", value: ENTITY_TYPE_LABELS[selectedEntry.entity_type] ?? selectedEntry.entity_type },
            { label: 'Élément concerné', value: selectedEntry.entityLabel },
          ].map((item) => (
            <div key={item.label} className="flex justify-between gap-4 border-b border-border/20 pb-3 last:border-0 last:pb-0">
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="text-right font-medium text-foreground">
                {item.badge ? (
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', item.badge)}>{item.value}</span>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={selectedEntry ? 'detail' : 'list'} variants={slide(dir)} initial="initial" animate="animate" exit="exit">
          {selectedEntry ? DetailLevel : ListLevel}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
