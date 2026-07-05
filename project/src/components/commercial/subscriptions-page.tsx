'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, X, Edit, Trash2, EyeOff, Eye } from 'lucide-react';
import { MOCK_SUBSCRIPTION_TIERS } from '@/lib/mock-data';
import { fetchSubscriptionTiers, deleteSubscriptionTier, setSubscriptionTierActive } from '@/lib/subscriptions/api-client';
import type { SubscriptionTierRow } from '@/lib/subscriptions/types';

export function SubscriptionsPageView({ initialTiers }: { initialTiers: SubscriptionTierRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tiers, setTiers] = useState(initialTiers);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SubscriptionTierRow | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const refresh = () => fetchSubscriptionTiers().then(setTiers).catch((e) => setError(e.message));

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

  const openDelete = (tier: SubscriptionTierRow) => {
    setDeleteTarget(tier);
    setConfirmChecked(false);
    setError(null);
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Abonnements & Tarifs"
          description="Configurez les paliers d'abonnement et la grille tarifaire"
          breadcrumbs={[
            { label: 'Commercial' },
            { label: 'Abonnements & Tarifs' },
          ]}
          actions={
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Modifier les tarifs
            </Button>
          }
        />

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Abonnés actifs</p>
                  <p className="text-2xl font-bold">8,420</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">42.1M</p>
                  <p className="text-xs text-muted-foreground">FCFA/mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nouveaux (mois)</p>
                  <p className="text-2xl font-bold">+1,247</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-600">+12.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de renouvellement</p>
                  <p className="text-2xl font-bold">78.5%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-amber-600">-2.1%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paliers d&apos;abonnement</CardTitle>
            <CardDescription>
              Suppression bloquée si le palier a déjà été vendu (historique de facturation) — désactivez-le à
              la place.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell className="font-medium capitalize">{tier.name}</TableCell>
                    <TableCell>{(tier.price ?? 0).toLocaleString('fr-FR')} FCFA</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={tier.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                        {tier.is_active ? 'Actif' : 'Désactivé'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            runAction(() => setSubscriptionTierActive({ id: tier.id, isActive: !tier.is_active }))
                          }
                        >
                          {tier.is_active ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5 mr-1" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Réactiver
                            </>
                          )}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openDelete(tier)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {tiers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                      Aucun palier.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matrice de droits par palier</CardTitle>
            <CardDescription>Configuration des fonctionnalités disponibles par palier</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Fonctionnalite</TableHead>
                  <TableHead className="text-center">
                    Basique
                    <Badge variant="outline" className="ml-2 bg-slate-50">2,500 FCFA</Badge>
                  </TableHead>
                  <TableHead className="text-center">
                    Standard
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">5,000 FCFA</Badge>
                  </TableHead>
                  <TableHead className="text-center">
                    Premium
                    <Badge variant="outline" className="ml-2 bg-violet-50 text-violet-700">8,000 FCFA</Badge>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Acces aux cours', key: 'lessons' },
                  { name: 'Exercices', key: 'exercises' },
                  { name: 'Examens officiels', key: 'exams' },
                  { name: 'Forum', key: 'forum' },
                  { name: 'Communautes WhatsApp', key: 'whatsapp' },
                  { name: 'Examens blancs', key: 'mock_exams' },
                ].map((feature) => (
                  <TableRow key={feature.key}>
                    <TableCell className="font-medium">{feature.name}</TableCell>
                    {MOCK_SUBSCRIPTION_TIERS.map((tier) => (
                      <TableCell key={tier.id} className="text-center">
                        {tier.features[feature.key as keyof typeof tier.features] ? (
                          <Check className="h-5 w-5 mx-auto text-emerald-500" />
                        ) : (
                          <X className="h-5 w-5 mx-auto text-slate-300" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classes par palier</CardTitle>
            <CardDescription>Association des classes aux differents paliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {MOCK_SUBSCRIPTION_TIERS.map((tier) => (
                <div key={tier.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{tier.name}</h4>
                    <Badge variant="outline">{tier.price.toLocaleString()} FCFA</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tier.classIds.map((classId) => (
                      <Badge key={classId} variant="secondary" className="text-xs">
                        {classId === 'c6e' ? '6eme' : classId === 'c5e' ? '5eme' : classId === 'c4e' ? '4eme' : classId === 'c3e' ? '3eme' : classId === 'c2nde' ? '2nde' : classId === 'c1ere' ? '1ere' : 'Terminale'}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique des prix</CardTitle>
            <CardDescription>Historique des changements de tarifs</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Palier</TableHead>
                  <TableHead>Ancien prix</TableHead>
                  <TableHead>Nouveau prix</TableHead>
                  <TableHead>Modifie par</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>01/09/2024</TableCell>
                  <TableCell>Premium</TableCell>
                  <TableCell>7,500 FCFA</TableCell>
                  <TableCell>8,000 FCFA</TableCell>
                  <TableCell>Marie Nguema</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>15/06/2024</TableCell>
                  <TableCell>Standard</TableCell>
                  <TableCell>4,500 FCFA</TableCell>
                  <TableCell>5,000 FCFA</TableCell>
                  <TableCell>Marie Nguema</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Supprimer un palier */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le palier « {deleteTarget?.name} »</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Si ce palier a déjà été vendu (au moins un abonnement lié), la
              suppression sera refusée — désactivez-le à la place pour le retirer sans casser l&apos;historique
              de facturation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-2">
            <Checkbox
              id="confirm-delete-tier"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked === true)}
            />
            <label htmlFor="confirm-delete-tier" className="text-sm">
              Je confirme vouloir supprimer définitivement ce palier.
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={!confirmChecked}
              onClick={() =>
                runAction(() => deleteSubscriptionTier({ id: deleteTarget!.id }), () => setDeleteTarget(null))
              }
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
