'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
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

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  scheduled: { label: 'Planifié', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  in_progress: { label: 'En cours', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  completed: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function SchoolYearPage() {
  const [showLaunchDialog, setShowLaunchDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const activePromotion = MOCK_SCHOOL_YEAR_PROMOTIONS.find(p => p.status === 'in_progress');
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
      <div className="min-h-full space-y-8 pb-12">
        <PageHeader
          title="Passage de classe"
          description="Gestion des campagnes annuelles de passage de classe et suivi des confirmations"
          breadcrumbs={[
            { label: 'Conformité' },
            { label: 'Passage de classe' },
          ]}
          actions={
            !activePromotion && draftPromotion ? (
              <Button size="sm" className="gap-2" onClick={() => setShowLaunchDialog(true)}>
                <Play className="h-4 w-4" />
                Lancer la campagne
              </Button>
            ) : !draftPromotion && !activePromotion ? (
              <Button size="sm" className="gap-2" onClick={() => setShowScheduleDialog(true)}>
                <Calendar className="h-4 w-4" />
                Nouvelle campagne
              </Button>
            ) : undefined
          }
        />

        {/* Info Banner */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
          <GraduationCap className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Fonctionnement du passage de classe</p>
            <p className="mt-0.5 text-blue-700/80 dark:text-blue-400/80 text-xs">
              <strong>Cas A :</strong> L&apos;élève conserve son compte avec le même identifiant. Sa classe est mise à jour.
              <br />
              <strong>Cas B :</strong> L&apos;élève crée un nouveau compte avec une nouvelle adresse email pour la nouvelle année scolaire.
            </p>
          </div>
        </motion.div>

        {/* KPI Strip */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Année scolaire actuelle', value: '2024-2025', icon: <Calendar className="h-5 w-5" />, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'Élèves actifs', value: '12,580', icon: <Users className="h-5 w-5" />, bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
            { label: 'Prochaine campagne', value: activePromotion ? 'En cours' : draftPromotion ? 'Planifiée' : 'Non planifiée', icon: <Clock className="h-5 w-5" />, bg: 'bg-amber-500/10', color: 'text-amber-500' },
          ].map((kpi) => (
            <motion.div key={kpi.label} variants={fadeUp}
              className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{kpi.label}</p>
                  <p className="mt-2 text-xl font-bold">{kpi.value}</p>
                </div>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ml-3', kpi.bg, kpi.color)}>
                  {kpi.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Active Campaign */}
        {activePromotion && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                  Campagne en cours : {activePromotion.name}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Du {new Date(activePromotion.startDate).toLocaleDateString('fr-FR')} au {new Date(activePromotion.endDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Badge className={cn('border-0', STATUS_CONFIG[activePromotion.status].color)}>
                {STATUS_CONFIG[activePromotion.status].label}
              </Badge>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taux de confirmation</span>
                  <span className="font-bold text-lg">{activePromotion.confirmationRate ?? 0}%</span>
                </div>
                <Progress value={activePromotion.confirmationRate ?? 0} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{activePromotion.confirmedStudents?.toLocaleString('fr-FR') ?? '-'} confirmés</span>
                  <span>{activePromotion.totalStudents?.toLocaleString('fr-FR') ?? '-'} total</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-emerald-600" />
                    Cas A (même compte)
                  </span>
                  <span className="font-medium">{activePromotion.caseA?.toLocaleString('fr-FR') ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Cas B (nouveau compte)
                  </span>
                  <span className="font-medium">{activePromotion.caseB?.toLocaleString('fr-FR') ?? '-'}</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Suspendre
                </Button>
                <Button size="sm">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Voir détails
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Campaign History */}
        <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border/40 p-5">
            <p className="font-semibold">Historique des campagnes</p>
            <p className="text-sm text-muted-foreground mt-0.5">Liste de toutes les campagnes de passage de classe</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 bg-muted/30">
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
                <TableRow key={promo.id} className="border-border/40 hover:bg-muted/30">
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
                  <TableCell>{promo.totalStudents?.toLocaleString('fr-FR') || '-'}</TableCell>
                  <TableCell>{promo.caseA?.toLocaleString('fr-FR') || '-'}</TableCell>
                  <TableCell>{promo.caseB?.toLocaleString('fr-FR') || '-'}</TableCell>
                  <TableCell>
                    {promo.confirmationRate ? (
                      <div className="flex items-center gap-2">
                        <Progress value={promo.confirmationRate} className="w-20 h-2" />
                        <span className="text-sm font-medium">{promo.confirmationRate}%</span>
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('border-0', STATUS_CONFIG[promo.status].color)}>
                      {STATUS_CONFIG[promo.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Process Description */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
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

          <Card className="rounded-2xl border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
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
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm dark:bg-amber-950/30 dark:border-amber-900/50">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-300">
                    Une fois lancée, la campagne enverra des notifications par email et push à tous les utilisateurs actifs.
                    Assurez-vous que les paramètres de notification sont correctement configurés.
                  </p>
                </div>
              </div>
              {draftPromotion && (
                <div className="rounded-lg bg-muted/40 border border-border/40 p-3 text-sm">
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
        <DialogContent>
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
