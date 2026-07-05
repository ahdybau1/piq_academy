'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Trash2, RotateCcw, XCircle } from 'lucide-react';
import { fetchTrashBatches, restoreTrashBatch, purgeTrashBatch } from '@/lib/trash/api-client';
import type { TrashBatch } from '@/lib/trash/types';

const TABLE_LABELS: Record<string, string> = {
  accounts: 'Compte(s) élève',
  profiles: 'Profil(s) élève',
  subscription_tiers: "Palier(s) d'abonnement",
  access_matrix: 'Ligne(s) de matrice de droits',
  academic_nodes: "Nœud(s) de l'arbre académique",
  official_exams: 'Examen(s) officiel(s)',
  exam_papers: "Sujet(s) d'examen",
  establishment_papers: "Épreuve(s) d'établissement",
  forum_threads: 'Sujet(s) de forum',
  forum_posts: 'Message(s) de forum',
  whatsapp_communities: 'Communauté(s) WhatsApp',
  content_translation_classes: 'Traduction(s) associée(s)',
  subject_class_links: 'Lien(s) matière-classe',
  content_catalog: 'Type(s) de catalogue',
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
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              {batches.length} lot(s) supprimé(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {batches.map((batch) => (
              <div key={batch.batch_id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Supprimé le {formatDate(batch.deleted_at)}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runAction(() => restoreTrashBatch({ batchId: batch.batch_id }))}
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Restaurer
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openPurge(batch)}>
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Purger définitivement
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(batch.tableCounts).map(([tableName, count]) => (
                    <Badge key={tableName} variant="outline">
                      {count} {TABLE_LABELS[tableName] ?? tableName}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {batches.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">La corbeille est vide.</p>
            )}
          </CardContent>
        </Card>
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
          <div className="flex items-center gap-2 py-2">
            <Checkbox
              id="confirm-purge"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked === true)}
            />
            <label htmlFor="confirm-purge" className="text-sm">
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
