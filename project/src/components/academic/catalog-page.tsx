'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tags, Plus, Trash2, ChevronRight, Home, ArrowLeft, Tag, Copy, AlertTriangle } from 'lucide-react';
import {
  fetchCatalog,
  createCatalogEntry,
  setCatalogEntryActive,
  deleteCatalogEntry,
  loadCatalogTemplate,
  duplicateCatalogToSubject,
} from '@/lib/content/api-client';
import { CATALOG_TEMPLATES } from '@/lib/content/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SubjectRow, CatalogEntryRow } from '@/lib/content/types';
import { cn } from '@/lib/utils';

type Dir = 'forward' | 'back';

function slide(dir: Dir): Variants {
  return {
    initial: { x: dir === 'forward' ? 64 : -64, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { x: dir === 'forward' ? -64 : 64, opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] } },
  };
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function CatalogPageView({ initialSubjects }: { initialSubjects: SubjectRow[] }) {
  const [, startTransition] = useTransition();

  const [selected, setSelected] = useState<SubjectRow | null>(null);
  const [dir, setDir] = useState<Dir>('forward');
  const [entries, setEntries] = useState<CatalogEntryRow[]>([]);
  const [newType, setNewType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingCascadeId, setPendingCascadeId] = useState<string | null>(null);
  const [duplicateTargetId, setDuplicateTargetId] = useState('');

  const refreshEntries = (id: string) => fetchCatalog(id).then(setEntries).catch((e) => setError(e.message));

  useEffect(() => {
    if (!selected) return;
    refreshEntries(selected.id);
  }, [selected]);

  const openSubject = (s: SubjectRow) => {
    setDir('forward');
    setSelected(s);
    setEntries([]);
    setPendingCascadeId(null);
    setDuplicateTargetId('');
  };
  const closeSubject = () => {
    setDir('back');
    setSelected(null);
  };

  const runAction = (fn: () => Promise<{ error?: string }>, onSuccess?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess?.();
    });
  };

  // ── LEVEL 0 — Matières ────────────────────────────────────────────────────

  const ListLevel = (
    <div className="space-y-6">
      <div className="space-y-3 pb-2">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span>Académique</span>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80">Catalogue pédagogique</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight">Catalogue pédagogique</h1>
        <p className="text-sm text-muted-foreground">
          Types d&apos;éléments par matière — sélectionnez une matière pour gérer son catalogue.
        </p>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="show">
        {initialSubjects.map((s) => (
          <motion.button
            key={s.id}
            variants={rowItem}
            onClick={() => openSubject(s)}
            className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/8">
              <Tags className="h-5 w-5 text-primary/80" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground transition-colors group-hover:text-primary">{s.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Types d&apos;éléments →</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-primary/50" />
          </motion.button>
        ))}
        {initialSubjects.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground/50">Aucune matière disponible.</div>
        )}
      </motion.div>
    </div>
  );

  // ── LEVEL 1 — Types d'éléments ────────────────────────────────────────────

  const duplicateTargetItems = Object.fromEntries(
    initialSubjects.filter((s) => s.id !== selected?.id).map((s) => [s.id, s.name])
  );

  const DetailLevel = selected && (
    <div className="space-y-6">
      <div className="space-y-3">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <button className="transition-colors hover:text-foreground" onClick={closeSubject}>
            Catalogue
          </button>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80">{selected.name}</span>
        </nav>
        <div className="flex items-start gap-3">
          <button
            onClick={closeSubject}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{selected.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Types d&apos;éléments pédagogiques</p>
          </div>
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
          {error}
        </div>
      )}

      {Object.keys(CATALOG_TEMPLATES).length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            Charger un modèle proposé
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(CATALOG_TEMPLATES).map((key) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                onClick={() =>
                  runAction(
                    () => loadCatalogTemplate({ subjectId: selected.id, templateKey: key }),
                    () => refreshEntries(selected.id)
                  )
                }
              >
                {key}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
          <h2 className="text-sm font-semibold">Types d&apos;éléments ({entries.length})</h2>
        </div>
        <div className="divide-y divide-border/30">
          {entries.map((entry) => (
            <div key={entry.id}>
              <div className="flex items-center gap-4 px-6 py-3.5">
                <Tag className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                <span className={cn('flex-1 text-sm font-medium', !entry.is_active && 'text-muted-foreground line-through')}>
                  {entry.element_type}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    entry.is_active
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {entry.is_active ? 'Actif' : 'Inactif'}
                </span>
                <Switch
                  checked={entry.is_active}
                  onCheckedChange={(v) => runAction(() => setCatalogEntryActive({ id: entry.id, isActive: v }), () => refreshEntries(selected.id))}
                />
                <button
                  onClick={() => {
                    setError(null);
                    startTransition(async () => {
                      const result = await deleteCatalogEntry({ id: entry.id });
                      if (result.error) {
                        setPendingCascadeId(entry.id);
                        return;
                      }
                      refreshEntries(selected.id);
                    });
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {pendingCascadeId === entry.id && (
                <div className="mx-6 mb-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span className="flex-1">
                    Ce type est encore utilisé par du contenu existant. Confirmer le détachement automatique (le contenu n&apos;est jamais
                    supprimé, seul le tag est retiré) ?
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 shrink-0 border-amber-300 text-xs text-amber-800 hover:bg-amber-100 dark:text-amber-300"
                    onClick={() =>
                      runAction(
                        () => deleteCatalogEntry({ id: entry.id, cascade: true }),
                        () => {
                          setPendingCascadeId(null);
                          refreshEntries(selected.id);
                        }
                      )
                    }
                  >
                    Confirmer
                  </Button>
                  <button
                    onClick={() => setPendingCascadeId(null)}
                    className="shrink-0 text-xs font-medium text-amber-700 hover:underline dark:text-amber-300"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          ))}
          {entries.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground/50">Aucun type pour l&apos;instant.</div>}
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          <Copy className="h-3.5 w-3.5" />
          Dupliquer vers une matière
        </p>
        <div className="flex gap-2">
          <Select items={duplicateTargetItems} value={duplicateTargetId} onValueChange={(v) => setDuplicateTargetId(v ?? '')}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Matière cible…" />
            </SelectTrigger>
            <SelectContent>
              {initialSubjects
                .filter((s) => s.id !== selected.id)
                .map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={!duplicateTargetId}
            onClick={() =>
              runAction(
                () => duplicateCatalogToSubject({ sourceSubjectId: selected.id, targetSubjectId: duplicateTargetId }),
                () => setDuplicateTargetId('')
              )
            }
          >
            Copier les types
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Nom du type (ex : Théorème)"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newType.trim())
              runAction(
                () => createCatalogEntry({ subjectId: selected.id, elementType: newType }),
                () => {
                  setNewType('');
                  refreshEntries(selected.id);
                }
              );
          }}
          className="flex-1"
        />
        <Button
          className="gap-2"
          onClick={() =>
            runAction(
              () => createCatalogEntry({ subjectId: selected.id, elementType: newType }),
              () => {
                setNewType('');
                refreshEntries(selected.id);
              }
            )
          }
          disabled={!newType.trim()}
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={selected ? 'detail' : 'list'} variants={slide(dir)} initial="initial" animate="animate" exit="exit">
          {selected ? DetailLevel : ListLevel}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
