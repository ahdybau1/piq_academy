'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  brouillon: { color: 'bg-slate-100 text-slate-700', icon: <Clock className="h-4 w-4" /> },
  en_attente_de_validation: { color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-4 w-4" /> },
  a_corriger: { color: 'bg-red-100 text-red-700', icon: <AlertCircle className="h-4 w-4" /> },
  publie: { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="h-4 w-4" /> },
  rejete: { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4" /> },
};

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ValidationQueuePageView({ initialItems }: { initialItems: ValidationQueueItem[] }) {
  const router = useRouter();
  const { currentUser } = useApp();
  const [, startTransition] = useTransition();

  const [items, setItems] = useState(initialItems);
  const [activeTab, setActiveTab] = useState('en_attente_de_validation');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [reason, setReason] = useState('');

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  const filteredItems = activeTab === 'all' ? items : items.filter((i) => i.status === activeTab);

  const stats = {
    pending: items.filter((i) => i.status === 'en_attente_de_validation').length,
    correction: items.filter((i) => i.status === 'a_corriger').length,
    published: items.filter((i) => i.status === 'publie').length,
    total: items.length,
  };

  const refresh = () => fetchValidationQueue().then(setItems).catch((e) => setError(e.message));

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

  const isOwnSubmission = selectedItem?.submitted_by === currentUser.id;

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="File de validation de contenu"
          description="Validez ou rejetez le contenu soumis"
          breadcrumbs={[{ label: 'Validation' }, { label: 'File de validation' }]}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('en_attente_de_validation')}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('a_corriger')}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">À corriger</p>
                  <p className="text-2xl font-bold text-red-600">{stats.correction}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('publie')}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Publiés</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.published}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('all')}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="en_attente_de_validation">En attente</TabsTrigger>
                  <TabsTrigger value="a_corriger">À corriger</TabsTrigger>
                  <TabsTrigger value="publie">Publiés</TabsTrigger>
                  <TabsTrigger value="all">Tous</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      'flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md',
                      selectedId === item.id && 'border-primary bg-primary/5'
                    )}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{item.lessonTitle ?? `${item.content_type} — ${item.content_id}`}</p>
                          {item.lessonTitle && (
                            <p className="text-sm text-muted-foreground">
                              {item.subjectName ?? '—'} · {item.chapterTitle ?? '—'}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className={STATUS_CONFIG[item.status]?.color}>
                          <span className="flex items-center gap-1">
                            {STATUS_CONFIG[item.status]?.icon}
                            {CONTENT_STATUS_LABELS[item.status] ?? item.status}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Soumis le {formatDate(item.created_at)}</p>
                    </div>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucun élément ici.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{selectedItem ? 'Détails' : 'Sélectionnez un élément'}</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedItem && (
                <div className="text-center text-muted-foreground py-12">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Sélectionnez un contenu pour voir les détails</p>
                </div>
              )}
              {selectedItem && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {selectedItem.lessonTitle ?? selectedItem.content_type}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Type:</span> {selectedItem.content_type}</p>
                      {selectedItem.subjectName && (
                        <p><span className="text-muted-foreground">Matière:</span> {selectedItem.subjectName}</p>
                      )}
                      {selectedItem.chapterTitle && (
                        <p><span className="text-muted-foreground">Chapitre:</span> {selectedItem.chapterTitle}</p>
                      )}
                      {selectedItem.rejection_reason && (
                        <p><span className="text-muted-foreground">Motif:</span> {selectedItem.rejection_reason}</p>
                      )}
                    </div>
                  </div>

                  {isOwnSubmission && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                      Vous êtes l&apos;auteur de cette soumission — vous ne pouvez pas la réviser vous-même.
                    </p>
                  )}

                  {selectedItem.status === 'en_attente_de_validation' && !isOwnSubmission && (
                    <div className="border-t pt-4 space-y-2">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() =>
                          runAction(() => approveValidation({ queueId: selectedItem.id }), () => setSelectedId(null))
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setReason('');
                            setError(null);
                            setShowCorrectionDialog(true);
                          }}
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Renvoyer pour correction
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setReason('');
                            setError(null);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter définitivement
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
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
                      setSelectedId(null);
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
                      setSelectedId(null);
                    }
                  )
                }
              >
                Confirmer le rejet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
