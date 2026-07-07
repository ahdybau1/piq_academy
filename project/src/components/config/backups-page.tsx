'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HardDrive,
  Download,
  Play,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  RotateCcw,
  Calendar,
  Database,
  Server,
  Shield,
  Loader2,
} from 'lucide-react';
import { MOCK_BACKUPS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { BackupRecord } from '@/lib/types';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  completed: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle className="h-4 w-4" /> },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
  failed: { label: 'Échoué', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-4 w-4" /> },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  automatic: { label: 'Automatique', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  manual: { label: 'Manuel', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

export default function BackupsPage() {
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const lastSuccessfulBackup = MOCK_BACKUPS.find(b => b.status === 'completed');
  const totalBackups = MOCK_BACKUPS.length;
  const successfulBackups = MOCK_BACKUPS.filter(b => b.status === 'completed').length;
  const failedBackups = MOCK_BACKUPS.filter(b => b.status === 'failed').length;

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setShowBackupDialog(false);
    }, 3000);
  };

  const handleRestore = () => {
    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
      setShowRestoreDialog(false);
    }, 5000);
  };

  const formatSize = (size: number) => `${size.toFixed(1)} GB`;

  return (
    <>
      <div className="min-h-full space-y-8 pb-12">
        <PageHeader
          title="Sauvegarde et restauration"
          description="Gestion des sauvegardes de la base de données et restauration en cas d&apos;incident"
          breadcrumbs={[
            { label: 'Configuration' },
            { label: 'Sauvegardes' },
          ]}
          actions={
            <Button size="sm" className="gap-2" onClick={() => setShowBackupDialog(true)}>
              <Play className="h-4 w-4" />
              Nouvelle sauvegarde
            </Button>
          }
        />

        {/* KPI Strip */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Dernière sauvegarde',
              value: lastSuccessfulBackup ? new Date(lastSuccessfulBackup.createdAt).toLocaleDateString('fr-FR') : 'Jamais',
              sub: lastSuccessfulBackup ? `${formatSize(lastSuccessfulBackup.size)} - ${lastSuccessfulBackup.duration}min` : undefined,
              icon: <CheckCircle className="h-5 w-5" />, bg: 'bg-emerald-500/10', color: 'text-emerald-500',
            },
            { label: 'Total sauvegardes', value: totalBackups.toString(), sub: `${successfulBackups} réussies`, icon: <Database className="h-5 w-5" />, bg: 'bg-blue-500/10', color: 'text-blue-500' },
            { label: 'Échecs récents', value: failedBackups.toString(), sub: 'Sur les 7 derniers jours', icon: <AlertCircle className="h-5 w-5" />, bg: 'bg-red-500/10', color: 'text-red-500' },
            { label: 'Stockage total', value: formatSize(MOCK_BACKUPS.reduce((acc, b) => acc + b.size, 0)), sub: `Sur ${totalBackups} fichiers`, icon: <HardDrive className="h-5 w-5" />, bg: 'bg-slate-500/10', color: 'text-slate-600 dark:text-slate-400' },
          ].map((kpi) => (
            <motion.div key={kpi.label} variants={fadeUp}
              className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{kpi.label}</p>
                  <p className="mt-2 text-xl font-bold">{kpi.value}</p>
                  {kpi.sub && <p className="mt-0.5 text-xs text-muted-foreground">{kpi.sub}</p>}
                </div>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ml-3', kpi.bg, kpi.color)}>
                  {kpi.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Prochaine sauvegarde automatique: 02:00
        </div>

        {/* Backup History */}
        <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border/40 p-5">
            <p className="font-semibold">Historique des sauvegardes</p>
            <p className="text-sm text-muted-foreground mt-0.5">Liste de toutes les sauvegardes effectuées</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 bg-muted/30">
                <TableHead>Date/Heure</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Déclenché par</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_BACKUPS.map((backup) => (
                <TableRow key={backup.id} className="border-border/40 hover:bg-muted/30">
                  <TableCell>
                    <div>
                      <p className="font-medium">{new Date(backup.createdAt).toLocaleDateString('fr-FR')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(backup.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('border-0', TYPE_CONFIG[backup.type].color)}>
                      {TYPE_CONFIG[backup.type].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {backup.size > 0 ? formatSize(backup.size) : '-'}
                  </TableCell>
                  <TableCell>
                    {backup.duration ? `${backup.duration} min` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('gap-1 border-0', STATUS_CONFIG[backup.status].color)}>
                      {STATUS_CONFIG[backup.status].icon}
                      {STATUS_CONFIG[backup.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {backup.triggeredBy || <span className="text-muted-foreground">Système</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 rounded-md hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {backup.status === 'completed' && (
                          <>
                            <DropdownMenuItem onClick={() => { setSelectedBackup(backup); setShowRestoreDialog(true); }}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restaurer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {backup.error && (
                          <DropdownMenuItem>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Voir erreur
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedBackup(backup); setShowDeleteDialog(true); }}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Storage Information */}
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
          <p className="flex items-center gap-2 font-semibold">
            <Server className="h-5 w-5" />
            Stockage et rétention
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">Configuration de la stratégie de sauvegarde</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Politique de rétention</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sauvegardes quotidiennes</span>
                    <span>30 jours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sauvegardes hebdomadaires</span>
                    <span>12 semaines</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sauvegardes mensuelles</span>
                    <span>12 mois</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Planification</p>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Tous les jours à 02:00 UTC</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Emplacement</p>
                <div className="rounded-xl bg-muted/40 border border-border/40 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">AWS S3 - Région: eu-west-3</span>
                  </div>
                  <p className="text-muted-foreground mt-1">Chiffré AES-256</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Utilisation du stockage</p>
                <div className="space-y-2">
                  <Progress value={65} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1.2 GB utilisés</span>
                    <span>2 GB alloués</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Backup Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle sauvegarde</DialogTitle>
            <DialogDescription>
              Déclencher une sauvegarde manuelle de la base de données
            </DialogDescription>
          </DialogHeader>
          {isBackingUp ? (
            <div className="py-8 space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">Sauvegarde en cours...</p>
                <p className="text-sm text-muted-foreground">Veuillez ne pas fermer cette fenêtre</p>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm dark:bg-amber-950/30 dark:border-amber-900/50">
                <p className="font-medium text-amber-800 dark:text-amber-300">Attention</p>
                <p className="text-amber-700 dark:text-amber-400/80 mt-1">
                  La sauvegarde peut prendre plusieurs minutes. Les performances du système pourraient être temporairement affectées.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBackupDialog(false)} disabled={isBackingUp}>
              Annuler
            </Button>
            <Button onClick={handleBackup} disabled={isBackingUp}>
              <Play className="h-4 w-4 mr-2" />
              Démarrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurer la sauvegarde</DialogTitle>
            <DialogDescription>
              Restaurer la base de données à partir de la sauvegarde sélectionnée
            </DialogDescription>
          </DialogHeader>
          {isRestoring ? (
            <div className="py-8 space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">Restauration en cours...</p>
                <p className="text-sm text-muted-foreground">Cette opération peut prendre plusieurs minutes</p>
              </div>
              <Progress value={30} className="h-2" />
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {selectedBackup && (
                <div className="rounded-lg bg-muted/40 border border-border/40 p-3 text-sm">
                  <p className="font-medium">Sauvegarde sélectionnée</p>
                  <div className="mt-2 space-y-1">
                    <p>Date: {new Date(selectedBackup.createdAt).toLocaleString('fr-FR')}</p>
                    <p>Taille: {formatSize(selectedBackup.size)}</p>
                  </div>
                </div>
              )}
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm dark:bg-red-950/30 dark:border-red-900/50">
                <p className="font-medium text-red-800 dark:text-red-300">Avertissement critique</p>
                <p className="text-red-700 dark:text-red-400/80 mt-1">
                  La restauration remplacera toutes les données actuelles. Cette action est irréversible.
                  Assurez-vous d&apos;avoir une sauvegarde récente avant de continuer.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)} disabled={isRestoring}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleRestore} disabled={isRestoring}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la sauvegarde</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette sauvegarde ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
