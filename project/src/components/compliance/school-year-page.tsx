'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
import { Label } from '@/components/ui/label';
import {
  Calendar,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Users,
  ArrowRight,
  GraduationCap,
  AlertCircle,
  ClipboardCheck,
  Loader2,
} from 'lucide-react';
import { MOCK_SCHOOL_YEAR_PROMOTIONS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { SchoolYearPromotion } from '@/lib/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Brouillon', color: 'text-slate-700', bgColor: 'bg-slate-100' },
  scheduled: { label: 'Planifié', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  in_progress: { label: 'En cours', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  completed: { label: 'Terminé', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  cancelled: { label: 'Annulé', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export default function SchoolYearPage() {
  const [showLaunchDialog, setShowLaunchDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<SchoolYearPromotion | null>(null);

  const activePromotion = MOCK_SCHOOL_YEAR_PROMOTIONS.find(p => p.status === 'in_progress');
  const lastPromotion = MOCK_SCHOOL_YEAR_PROMOTIONS.find(p => p.status === 'completed');
  const draftPromotion = MOCK_SCHOOL_YEAR_PROMOTIONS.find(p => p.status === 'draft');

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      setShowLaunchDialog(false);
    }, 3000);
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Passage de classe"
          description="Gestion des campagnes annuelles de passage de classe et suivi des confirmations"
          breadcrumbs={[
            { label: 'Conformité' },
            { label: 'Passage de classe' },
          ]}
        />

        {/* Info Banner */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Fonctionnement du passage de classe</p>
              <p className="text-blue-700 mt-1">
                <strong>Cas A :</strong> L&apos;élève conserve son compte avec le même identifiant. Sa classe est mise à jour.
                <br />
                <strong>Cas B :</strong> L&apos;élève crée un nouveau compte avec une nouvelle adresse email pour la nouvelle année scolaire.
              </p>
            </div>
          </div>
        </div>

        {/* Current State */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Année scolaire actuelle</p>
                  <p className="text-xl font-bold">2024-2025</p>
                </div>
                <Calendar className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Élèves actifs</p>
                  <p className="text-xl font-bold">12,580</p>
                </div>
                <Users className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Prochaine campagne</p>
                  <p className="text-xl font-bold">
                    {activePromotion ? 'En cours' : draftPromotion ? 'Planifiée' : 'Non planifiée'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active/Latest Campaign */}
        {activePromotion && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                    Campagne en cours: {activePromotion.name}
                  </CardTitle>
                  <CardDescription>
                    Du {new Date(activePromotion.startDate).toLocaleDateString('fr-FR')} au {new Date(activePromotion.endDate).toLocaleDateString('fr-FR')}
                  </CardDescription>
                </div>
                <Badge className={cn(STATUS_CONFIG[activePromotion.status].bgColor, STATUS_CONFIG[activePromotion.status].color)}>
                  {STATUS_CONFIG[activePromotion.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Taux de confirmation</span>
                    <span className="font-bold text-lg">{activePromotion.confirmationRate ?? 0}%</span>
                  </div>
                  <Progress value={activePromotion.confirmationRate ?? 0} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{activePromotion.confirmedStudents?.toLocaleString() ?? '-'} confirmés</span>
                    <span>{activePromotion.totalStudents?.toLocaleString() ?? '-'} total</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-emerald-600" />
                      Cas A (même compte)
                    </span>
                    <span className="font-medium">{activePromotion.caseA?.toLocaleString() ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Cas B (nouveau compte)
                    </span>
                    <span className="font-medium">{activePromotion.caseB?.toLocaleString() ?? '-'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Suspendre
                  </Button>
                  <Button>
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Voir détails
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign Actions */}
        <div className="flex items-center gap-4">
          {!activePromotion && draftPromotion && (
            <Button onClick={() => setShowLaunchDialog(true)}>
              <Play className="h-4 w-4 mr-2" />
              Lancer la campagne {draftPromotion.name}
            </Button>
          )}
          {!draftPromotion && !activePromotion && (
            <Button onClick={() => setShowScheduleDialog(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Nouvelle campagne
            </Button>
          )}
        </div>

        {/* Campaign History */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des campagnes</CardTitle>
            <CardDescription>
              Liste de toutes les campagnes de passage de classe
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campagne</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Élèves concernés</TableHead>
                  <TableHead>Cas A</TableHead>
                  <TableHead>Cas B</TableHead>
                  <TableHead>Confirmation</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SCHOOL_YEAR_PROMOTIONS.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{promo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {promo.fromYear} → {promo.toYear}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(promo.startDate).toLocaleDateString('fr-FR')}</p>
                        <p className="text-muted-foreground">au {new Date(promo.endDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </TableCell>
                    <TableCell>{promo.totalStudents?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{promo.caseA?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{promo.caseB?.toLocaleString() || '-'}</TableCell>
                    <TableCell>
                      {promo.confirmationRate ? (
                        <div className="flex items-center gap-2">
                          <Progress value={promo.confirmationRate} className="w-20 h-2" />
                          <span className="text-sm font-medium">{promo.confirmationRate}%</span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(STATUS_CONFIG[promo.status].bgColor, STATUS_CONFIG[promo.status].color)}>
                        {STATUS_CONFIG[promo.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Process Description */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-emerald-600" />
                Cas A : Conservation du compte
              </CardTitle>
              <CardDescription>
                L&apos;élève conserve son identifiant existant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <span>L&apos;élève se connecte avec ses identifiants actuels</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <span>Il confirme sa nouvelle classe (passage automatique ou manuel)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <span>Ses données pédagogiques sont conservées</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <span>Historique et progression sont migrés vers la nouvelle classe</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Cas B : Nouveau compte
              </CardTitle>
              <CardDescription>
                L&apos;élève crée un nouveau compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>L&apos;élève a besoin d&apos;une nouvelle adresse email</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>Il crée un nouveau compte depuis la page d&apos;inscription</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>Les anciennes données ne sont pas migrées</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>Le compte précédent est archivé après la campagne</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Launch Dialog */}
      <Dialog open={showLaunchDialog} onOpenChange={setShowLaunchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lancer la campagne de passage</DialogTitle>
            <DialogDescription>
              Cette action enverra des notifications à tous les élèves actifs pour confirmer leur passage de classe.
            </DialogDescription>
          </DialogHeader>
          {isLaunching ? (
            <div className="py-8 space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">Lancement en cours...</p>
                <p className="text-sm text-muted-foreground">Préparation des notifications</p>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-amber-800">
                    Une fois lancée, la campagne enverra des notifications par email et push à tous les utilisateurs actifs.
                    Assurez-vous que les paramètres de notification sont correctement configurés.
                  </p>
                </div>
              </div>
              {draftPromotion && (
                <div className="rounded-lg bg-slate-50 border p-3 text-sm">
                  <p className="font-medium">{draftPromotion.name}</p>
                  <p className="text-muted-foreground mt-1">
                    {draftPromotion.fromYear} → {draftPromotion.toYear}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLaunchDialog(false)} disabled={isLaunching}>
              Annuler
            </Button>
            <Button onClick={handleLaunch} disabled={isLaunching}>
              <Play className="h-4 w-4 mr-2" />
              Lancer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle campagne de passage</DialogTitle>
            <DialogDescription>
              Planifiez la campagne de passage pour la prochaine année scolaire
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Année source</Label>
                <Input defaultValue="2024-2025" />
              </div>
              <div className="space-y-2">
                <Label>Année cible</Label>
                <Input defaultValue="2025-2026" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input type="date" defaultValue="2025-07-01" />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input type="date" defaultValue="2025-07-31" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowScheduleDialog(false)}>
              <Calendar className="h-4 w-4 mr-2" />
              Créer en brouillon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
