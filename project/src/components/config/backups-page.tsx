'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  RefreshCw,
  Download,
  Upload,
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  completed: { label: 'Terminé', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: <CheckCircle className="h-4 w-4" /> },
  in_progress: { label: 'En cours', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
  failed: { label: 'Échoué', color: 'text-red-700', bgColor: 'bg-red-100', icon: <XCircle className="h-4 w-4" /> },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  automatic: { label: 'Automatique', color: 'bg-slate-100 text-slate-700' },
  manual: { label: 'Manuel', color: 'bg-blue-100 text-blue-700' },
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
      <div className="space-y-6">
        <PageHeader
          title="Sauvegarde et restauration"
          description="Gestion des sauvegardes de la base de données et restauration en cas d&apos;incident"
          breadcrumbs={[
            { label: 'Configuration' },
            { label: 'Sauvegardes' },
          ]}
        />

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dernière sauvegarde</p>
                  <p className="text-xl font-bold">
                    {lastSuccessfulBackup
                      ? new Date(lastSuccessfulBackup.createdAt).toLocaleDateString('fr-FR')
                      : 'Jamais'}
                  </p>
                  {lastSuccessfulBackup && (
                    <p className="text-xs text-muted-foreground">
                      {formatSize(lastSuccessfulBackup.size)} - {lastSuccessfulBackup.duration}min
                    </p>
                  )}
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total sauvegardes</p>
                  <p className="text-2xl font-bold">{totalBackups}</p>
                  <p className="text-xs text-muted-foreground">{successfulBackups} réussies</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Échecs récents</p>
                  <p className="text-2xl font-bold text-red-600">{failedBackups}</p>
                  <p className="text-xs text-muted-foreground">Sur les 7 derniers jours</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stockage total</p>
                  <p className="text-xl font-bold">
                    {formatSize(MOCK_BACKUPS.reduce((acc, b) => acc + b.size, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">Sur {totalBackups} fichiers</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <HardDrive className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowBackupDialog(true)}>
              <Play className="h-4 w-4 mr-2" />
              Nouvelle sauvegarde
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Prochaine sauvegarde automatique: 02:00
          </div>
        </div>

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des sauvegardes</CardTitle>
            <CardDescription>
              Liste de toutes les sauvegardes effectuées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
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
                  <TableRow key={backup.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{new Date(backup.createdAt).toLocaleDateString('fr-FR')}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(backup.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={TYPE_CONFIG[backup.type].color}>
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
                      <Badge variant="outline" className={cn(STATUS_CONFIG[backup.status].bgColor, STATUS_CONFIG[backup.status].color, 'gap-1')}>
                        {STATUS_CONFIG[backup.status].icon}
                        {STATUS_CONFIG[backup.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {backup.triggeredBy || <span className="text-muted-foreground">Système</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 rounded-md hover:bg-slate-100">
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
          </CardContent>
        </Card>

        {/* Storage Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Stockage et rétention
            </CardTitle>
            <CardDescription>
              Configuration de la stratégie de sauvegarde
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
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
                  <div className="rounded-lg bg-slate-50 border p-3 text-sm">
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
          </CardContent>
        </Card>
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
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
                <p className="font-medium text-amber-800">Attention</p>
                <p className="text-amber-700 mt-1">
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
                <div className="rounded-lg bg-slate-50 border p-3 text-sm">
                  <p className="font-medium">Sauvegarde sélectionnée</p>
                  <div className="mt-2 space-y-1">
                    <p>Date: {new Date(selectedBackup.createdAt).toLocaleString('fr-FR')}</p>
                    <p>Taille: {formatSize(selectedBackup.size)}</p>
                  </div>
                </div>
              )}
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm">
                <p className="font-medium text-red-800">Avertissement critique</p>
                <p className="text-red-700 mt-1">
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
