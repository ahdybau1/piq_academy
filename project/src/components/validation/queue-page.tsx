'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText, CheckCircle, XCircle, AlertCircle, ChevronRight,
  ArrowLeft, Home, Layers,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import {
  fetchValidationQueue,
  approveValidation,
  requestCorrection,
  rejectDefinitively,
} from '@/lib/content/api-client';
import { CONTENT_STATUS_LABELS } from '@/lib/content/constants';
import type { ValidationQueueItem } from '@/lib/content/types';
import { cn } from '@/lib/utils';

// ── Animation ─────────────────────────────────────────────────────────────────

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
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { dot: string; badge: string }> = {
  brouillon: { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  en_attente_de_validation: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  a_corriger: { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
  publie: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  rejete: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({ label, count, dot, active, onClick }: {
  label: string; count: number; dot: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-medium transition-all',
        active
          ? 'border-primary/40 bg-primary/8 text-primary shadow-sm'
          : 'border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground'
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', dot)} />
      {label}
      <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums', active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>
        {count}
      </span>
    </button>
  );
}

export function ValidationQueuePageView({
  initialItems,
  countryId,
}: {
  initialItems: ValidationQueueItem[];
  countryId: string | null;
}) {
  const router = useRouter();
  const { currentUser } = useApp();
  const [, startTransition] = useTransition();

  const [items, setItems] = useState(initialItems);
  const [activeTab, setActiveTab] = useState('en_attente_de_validation');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dir, setDir] = useState<Dir>('forward');
  const [error, setError] = useState<string | null>(null);

  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [reason, setReason] = useState('');

  // `initialItems` vient du Server Component et reflète déjà le pays sélectionné ;
  // un changement de pays (switchCountry -> router.refresh()) ne remonte pas ce
  // composant, donc on resynchronise l'état local pendant le rendu (pattern React
  // officiel pour réinitialiser un state dérivé d'une prop, plutôt qu'un effet).
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);
  if (initialItems !== prevInitialItems) {
    setPrevInitialItems(initialItems);
    setItems(initialItems);
  }

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  const filteredItems = activeTab === 'all' ? items : items.filter((i) => i.status === activeTab);

  const stats = {
    pending: items.filter((i) => i.status === 'en_attente_de_validation').length,
    correction: items.filter((i) => i.status === 'a_corriger').length,
    published: items.filter((i) => i.status === 'publie').length,
    total: items.length,
  };

  const refresh = () => fetchValidationQueue(undefined, countryId ?? undefined).then(setItems).catch((e) => setError(e.message));

  const runAction = (fn: () => Promise<{ error?: string }>, onSuccess?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      router.refresh();
      refresh();
    });
  };

  const openItem = (id: string) => {
    setDir('forward');
    setSelectedId(id);
  };
  const closeItem = () => {
    setDir('back');
    setSelectedId(null);
  };

  const isOwnSubmission = selectedItem?.submitted_by === currentUser.id;

  // ── LEVEL 0 — Liste ───────────────────────────────────────────────────────

  const ListLevel = (
    <div className="space-y-6">
      <div className="space-y-3 pb-2">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span>Validation</span>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80">File de validation</span>
        </nav>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">File de validation de contenu</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Validez ou rejetez le contenu soumis</p>
          </div>
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatPill label="En attente" count={stats.pending} dot="bg-amber-500" active={activeTab === 'en_attente_de_validation'} onClick={() => setActiveTab('en_attente_de_validation')} />
        <StatPill label="À corriger" count={stats.correction} dot="bg-rose-500" active={activeTab === 'a_corriger'} onClick={() => setActiveTab('a_corriger')} />
        <StatPill label="Publiés" count={stats.published} dot="bg-emerald-500" active={activeTab === 'publie'} onClick={() => setActiveTab('publie')} />
        <StatPill label="Tous" count={stats.total} dot="bg-primary" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {filteredItems.map((it) => {
          const cfg = STATUS_CFG[it.status] ?? STATUS_CFG.brouillon;
          return (
            <motion.button
              key={it.id}
              variants={item}
              onClick={() => openItem(it.id)}
              className="group w-full rounded-2xl border border-border/40 bg-card p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/8">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {it.lessonTitle ?? `${it.content_type} — ${it.content_id}`}
                  </p>
                  {it.subjectName && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{it.subjectName}</span>
                      <ChevronRight className="h-3 w-3 opacity-40" />
                      <span>{it.chapterTitle ?? '—'}</span>
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">Soumis le {formatDate(it.created_at)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={cn('flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', cfg.badge)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                    {CONTENT_STATUS_LABELS[it.status] ?? it.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/50" />
                </div>
              </div>
            </motion.button>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
            <CheckCircle className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Aucun élément ici.</p>
          </div>
        )}
      </motion.div>
    </div>
  );

  // ── LEVEL 1 — Détail ──────────────────────────────────────────────────────

  const DetailLevel = selectedItem && (() => {
    const cfg = STATUS_CFG[selectedItem.status] ?? STATUS_CFG.brouillon;
    return (
      <div className="space-y-6">
        <div className="space-y-3 pb-2">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground">
            <Home className="h-3 w-3" />
            <ChevronRight className="h-3 w-3 opacity-30" />
            <button className="transition-colors hover:text-foreground" onClick={closeItem}>File de validation</button>
            <ChevronRight className="h-3 w-3 opacity-30" />
            <span className="max-w-[200px] truncate font-medium text-foreground/80">{selectedItem.lessonTitle ?? selectedItem.content_type}</span>
          </nav>
          <div className="flex items-start gap-3">
            <button
              onClick={closeItem}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold tracking-tight">{selectedItem.lessonTitle ?? selectedItem.content_type}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Détail de la soumission</p>
            </div>
            <span className={cn('shrink-0 rounded-full px-3 py-1 text-xs font-semibold', cfg.badge)}>
              {CONTENT_STATUS_LABELS[selectedItem.status] ?? selectedItem.status}
            </span>
          </div>
          <div className="relative h-px w-full bg-border/40">
            <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
          <dl className="space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-muted-foreground">Type</dt>
              <dd className="flex items-center gap-2 text-sm font-semibold">
                <Layers className="h-3.5 w-3.5 text-primary" />
                {selectedItem.content_type}
              </dd>
            </div>
            {selectedItem.subjectName && (
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">Matière</dt>
                <dd className="text-sm font-semibold">{selectedItem.subjectName}</dd>
              </div>
            )}
            {selectedItem.chapterTitle && (
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">Chapitre</dt>
                <dd className="max-w-[220px] truncate text-right text-sm font-semibold" title={selectedItem.chapterTitle}>
                  {selectedItem.chapterTitle}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="text-sm text-muted-foreground">Soumis le</dt>
              <dd className="text-sm font-semibold">{formatDate(selectedItem.created_at)}</dd>
            </div>
          </dl>

          {selectedItem.rejection_reason && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-900/40 dark:bg-rose-950/30">
              <p className="font-semibold text-rose-800 dark:text-rose-300">Motif</p>
              <p className="mt-1 text-rose-700 dark:text-rose-400">{selectedItem.rejection_reason}</p>
            </div>
          )}
        </div>

        {isOwnSubmission && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Vous êtes l&apos;auteur de cette soumission — vous ne pouvez pas la réviser vous-même.</p>
          </div>
        )}

        {selectedItem.status === 'en_attente_de_validation' && !isOwnSubmission && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Décision</p>
            <Button
              className="w-full gap-2 bg-emerald-600 font-semibold shadow-sm hover:bg-emerald-700"
              onClick={() =>
                runAction(() => approveValidation({ queueId: selectedItem.id }), () => closeItem())
              }
            >
              <CheckCircle className="h-4 w-4" />
              Approuver
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                onClick={() => {
                  setReason('');
                  setError(null);
                  setShowCorrectionDialog(true);
                }}
              >
                <AlertCircle className="h-4 w-4" />
                Renvoyer pour correction
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                onClick={() => {
                  setReason('');
                  setError(null);
                  setShowRejectDialog(true);
                }}
              >
                <XCircle className="h-4 w-4" />
                Rejeter définitivement
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  })();

  return (
    <>
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedItem ? 'detail' : 'list'}
            variants={slide(dir)}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {selectedItem ? DetailLevel : ListLevel}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Renvoyer pour correction */}
      <Dialog open={showCorrectionDialog} onOpenChange={setShowCorrectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renvoyer pour correction</DialogTitle>
            <DialogDescription>
              Le contenu repasse en statut « à corriger » et pourra être resoumis par l&apos;auteur.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="correction-reason">Motif</Label>
            <Textarea id="correction-reason" className="mt-2" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCorrectionDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={() =>
                runAction(
                  () => requestCorrection({ queueId: selectedItem!.id, reason }),
                  () => {
                    setShowCorrectionDialog(false);
                    closeItem();
                  }
                )
              }
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejeter définitivement */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter définitivement</DialogTitle>
            <DialogDescription>
              Ce statut est terminal — le contenu ne pourra pas être resoumis dans cet état.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="reject-reason">Motif</Label>
            <Textarea id="reject-reason" className="mt-2" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                runAction(
                  () => rejectDefinitively({ queueId: selectedItem!.id, reason }),
                  () => {
                    setShowRejectDialog(false);
                    closeItem();
                  }
                )
              }
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
