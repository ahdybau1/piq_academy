'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, CreditCard as Edit2, X, Check, Globe } from 'lucide-react';
import { fetchTerms, createTerm, updateTerm } from '@/lib/content/api-client';
import type { TermRow } from '@/lib/content/types';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/app-context';

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function emptyForm() {
  return { name: '', schoolYear: '', startDate: '', endDate: '' };
}

function CollapseForm({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }}
          exit={{ height: 0, opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] } }}
          className="overflow-hidden"
        >
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/[0.025] p-5">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TermsPageView() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Le pays est celui choisi dans le header (ou le pays assigné, non modifiable, pour
  // les rôles à périmètre fixe) — plus de sélecteur local dupliqué sur cette page.
  const { selectedCountry } = useApp();
  const countryId = selectedCountry?.id ?? null;

  const [terms, setTerms] = useState<TermRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const refreshTerms = (id: string) => fetchTerms(id).then(setTerms).catch((e) => setError(e.message));

  // Changement de pays : on réinitialise la liste et le formulaire pendant le rendu
  // (pattern React officiel — pas de setState synchrone dans un effet), puis on ne
  // garde dans l'effet que le vrai effet de bord (le fetch, asynchrone).
  const [prevCountryId, setPrevCountryId] = useState(countryId);
  if (countryId !== prevCountryId) {
    setPrevCountryId(countryId);
    setTerms([]);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  useEffect(() => {
    if (!countryId) return;
    refreshTerms(countryId);
  }, [countryId]);

  const startEdit = (t: TermRow) => {
    setEditingId(t.id);
    setForm({ name: t.name, schoolYear: t.school_year, startDate: t.start_date, endDate: t.end_date });
    setShowForm(true);
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const isRunningRef = useRef(false);
  const runAction = (fn: () => Promise<{ error?: string }>, onSuccess?: () => void) => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const result = await fn();
        if (result.error) {
          setError(result.error);
          return;
        }
        onSuccess?.();
        router.refresh();
      } finally {
        isRunningRef.current = false;
      }
    });
  };

  const submit = () => {
    if (!countryId) return;
    if (editingId) {
      runAction(
        () => updateTerm({ id: editingId, ...form }),
        () => {
          cancelForm();
          refreshTerms(countryId);
        }
      );
    } else {
      runAction(
        () => createTerm({ countryId, ...form }),
        () => {
          cancelForm();
          refreshTerms(countryId);
        }
      );
    }
  };

  const fmt = (d: string) => {
    if (!d) return '—';
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trimestres"
        description="Découpage temporel par pays (mécanisme invisible côté élève, section 1.8)"
        breadcrumbs={[{ label: 'Académique' }, { label: 'Trimestres' }]}
        actions={
          countryId ? (
            <Button size="sm" className="gap-2" onClick={startCreate}>
              <Plus className="h-4 w-4" />
              Nouveau trimestre
            </Button>
          ) : undefined
        }
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
          <X className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!countryId && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <Globe className="h-5 w-5 shrink-0" />
          Sélectionnez un pays via le menu « Périmètre » en haut de page pour gérer ses trimestres.
        </div>
      )}

      <CollapseForm open={showForm && !!countryId}>
        <p className="mb-4 text-sm font-semibold">{editingId ? 'Modifier le trimestre' : 'Créer un trimestre'}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nom</Label>
            <Input className="mt-1" placeholder="ex. Trimestre 1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Année scolaire</Label>
            <Input className="mt-1" placeholder="ex. 2025-2026" value={form.schoolYear} onChange={(e) => setForm({ ...form, schoolYear: e.target.value })} />
          </div>
          <div>
            <Label>Date de début</Label>
            <Input type="date" className="mt-1" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div>
            <Label>Date de fin</Label>
            <Input type="date" className="mt-1" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={cancelForm}>
            Annuler
          </Button>
          <Button size="sm" disabled={isPending || !form.name || !form.schoolYear} onClick={submit} className="gap-2">
            <Check className="h-4 w-4" />
            {editingId ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </CollapseForm>

      {countryId && (
        <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
          {terms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
              <Calendar className="mb-3 h-10 w-10" />
              <p className="text-sm font-medium">Aucun trimestre pour ce pays</p>
              <Button size="sm" variant="outline" className="mt-4 gap-2" onClick={startCreate}>
                <Plus className="h-4 w-4" />
                Créer le premier trimestre
              </Button>
            </div>
          )}
          {terms.map((t, idx) => (
            <motion.div
              key={t.id}
              variants={item}
              className={cn(
                'group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-sm',
                'transition-all hover:border-border/70 hover:shadow-md',
                editingId === t.id && 'border-primary/30 bg-primary/[0.015] ring-2 ring-primary/15'
              )}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-sm font-bold text-violet-600 dark:text-violet-400">
                T{idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{t.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {t.school_year}
                  </span>
                  <span>
                    {fmt(t.start_date)} → {fmt(t.end_date)}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 gap-2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => startEdit(t)}
              >
                <Edit2 className="h-3.5 w-3.5" />
                Modifier
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
