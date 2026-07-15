'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, RotateCcw, Circle as XCircle, Package, TriangleAlert as AlertTriangle } from 'lucide-react';
import { fetchTrashBatches, restoreTrashBatch, purgeTrashBatch } from '@/lib/trash/api-client';
import type { TrashBatch } from '@/lib/trash/types';
import { cn } from '@/lib/utils';

const TABLE_LABELS: Record<string, string> = {
  accounts: 'Compte(s) élève',
  profiles: 'Profil(s) élève',
  subscription_tiers: "Palier(s) d'abonnement",
  access_matrix: 'Ligne(s) de matrice de droits',
  academic_nodes: "Nœud(s) de l'arbre académique",
  chapters: 'Chapitre(s)',
  lessons: 'Leçon(s)',
  exercises: 'Exercice(s)',
  media_library: 'Média(s)',
  official_exams: 'Examen(s) officiel(s)',
  exam_type_classes: 'Classe(s) habilitée(s) à un examen',
  exam_papers: "Sujet(s) d'examen",
  exam_paper_shared_exams: "Partage(s) d'épreuve entre examens",
  establishment_papers: "Épreuve(s) d'établissement",
  forum_threads: 'Sujet(s) de forum',
  forum_posts: 'Message(s) de forum',
  whatsapp_communities: 'Communauté(s) WhatsApp',
  content_translation_classes: 'Traduction(s) associée(s)',
  subject_class_links: 'Lien(s) matière-classe',
  content_catalog: 'Type(s) de catalogue',
};

const TABLE_COLORS: Record<string, string> = {
  accounts: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  profiles: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  academic_nodes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  official_exams: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  forum_threads: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TrashPageView({ initialBatches }: { initialBatches: TrashBatch[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [batches, setBatches] = useState(initialBatches);
  const [error, setError] = useState<string | null>(null);

  const [purgeTarget, setPurgeTarget] = useState<TrashBatch | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const refresh = () => fetchTrashBatches().then(setBatches).catch((e) => setError(e.message));

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

  const openPurge = (batch: TrashBatch) => {
    setPurgeTarget(batch);
    setConfirmChecked(false);
    setError(null);
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Corbeille"
          description="Éléments supprimés, restaurables tant qu'ils n'ont pas été purgés définitivement"
          breadcrumbs={[{ label: 'Système' }, { label: 'Corbeille' }]}
        />

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {batches.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">{batches.length} lot(s) en attente de purge</p>
              <p className="mt-0.5 text-amber-700/80 dark:text-amber-400/80">
                Ces éléments peuvent être restaurés ou purgés définitivement. Ils ne sont pas accessibles aux
                utilisateurs tant qu&apos;ils se trouvent dans la corbeille.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4 text-base font-semibold">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
            {batches.length === 0 ? 'Corbeille vide' : `${batches.length} lot(s) supprimé(s)`}
          </div>
          <div className="divide-y divide-border/40">
            {batches.map((batch) => (
              <div key={batch.batch_id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{batch.totalCount} élément(s)</p>
                      <span className="text-xs text-muted-foreground">supprimé(s) le {formatDate(batch.deleted_at)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(batch.tableCounts).map(([tableName, count]) => (
                        <span
                          key={tableName}
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                            TABLE_COLORS[tableName] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          )}
                        >
                          {count} {TABLE_LABELS[tableName] ?? tableName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 pl-14 sm:pl-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                    onClick={() => runAction(() => restoreTrashBatch({ batchId: batch.batch_id }))}
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Restaurer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    onClick={() => openPurge(batch)}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Purger
                  </Button>
                </div>
              </div>
            ))}
            {batches.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <Trash2 className="h-8 w-8" />
                </div>
                <p className="font-semibold text-foreground">La corbeille est vide</p>
                <p className="mt-1 text-sm text-muted-foreground">Aucun élément supprimé à restaurer ou à purger.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purger définitivement */}
      <Dialog open={!!purgeTarget} onOpenChange={(open) => !open && setPurgeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purger définitivement ce lot</DialogTitle>
            <DialogDescription>
              Action irréversible : ce lot ne pourra plus jamais être restauré une fois purgé.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
            <Checkbox
              id="confirm-purge"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked === true)}
            />
            <label htmlFor="confirm-purge" className="cursor-pointer text-sm">
              Je confirme vouloir purger définitivement ce lot.
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurgeTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={!confirmChecked}
              onClick={() =>
                runAction(() => purgeTrashBatch({ batchId: purgeTarget!.batch_id }), () => setPurgeTarget(null))
              }
            >
              Purger définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
