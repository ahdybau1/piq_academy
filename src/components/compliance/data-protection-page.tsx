'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { UserX, Download, Trash2, Clock, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, Search, FileText, Database, Loader as Loader2, Eye } from 'lucide-react';
import { MOCK_DELETION_REQUESTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { DataDeletionRequest } from '@/lib/types';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };
const rowItem: Variants = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } } };

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  account_deletion: { label: 'Suppression de compte', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <UserX className="h-4 w-4" /> },
  data_export: { label: 'Export de données', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Download className="h-4 w-4" /> },
  right_to_be_forgotten: { label: 'Droit à l\'oubli', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: <Trash2 className="h-4 w-4" /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="h-4 w-4" /> },
  processing: { label: 'En cours', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
  completed: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-4 w-4" /> },
};

const TYPE_FILTER_ITEMS: Record<string, string> = {
  all: 'Tous types',
  account_deletion: 'Suppression',
  data_export: 'Export',
  right_to_be_forgotten: 'Oubli',
};

const STATUS_FILTER_ITEMS: Record<string, string> = {
  all: 'Tous',
  pending: 'En attente',
  processing: 'En cours',
  completed: 'Terminés',
};

const RETENTION_POLICIES = [
  { label: 'Comptes utilisateurs', desc: 'Données personnelles et profils', icon: <Database className="h-5 w-5" />, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', duration: '3 ans après inactivité', note: 'Suppression automatique' },
  { label: 'Historique pédagogique', desc: 'Notes, progression, exercices', icon: <FileText className="h-5 w-5" />, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', duration: '5 ans', note: 'Archivage puis suppression' },
  { label: 'Transactions financières', desc: 'Paiements, factures, remboursements', icon: <FileText className="h-5 w-5" />, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', duration: '7 ans', note: 'Obligation légale' },
  { label: 'Logs d\'accès', desc: 'Connexions, journal d\'audit', icon: <Database className="h-5 w-5" />, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400', duration: '2 ans', note: 'Anonymisation après 6 mois' },
];

const COMPLIANCE_ITEMS = [
  { label: 'Mentions légales', desc: 'Informations sur le traitement des données', status: 'ok' as const },
  { label: 'Autorisation APDP', desc: 'Autorisation préalable de l\'Autorité de Protection des Données Personnelles', status: 'warn' as const },
  { label: 'Transfert hors Cameroun', desc: 'Hébergement Supabase situé hors du territoire national', status: 'warn' as const },
  { label: 'Droit à l\'oubli', desc: 'Procédure de suppression de données implémentée', status: 'ok' as const },
  { label: 'Export de données', desc: 'Portabilité des données personnelles', status: 'ok' as const },
];

export default function DataProtectionPage() {
  const [activeTab, setActiveTab] = useState('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const [typeFilter, setTypeFilter] = useState<string | null>('all');
  const [selectedRequest, setSelectedRequest] = useState<DataDeletionRequest | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const filteredRequests = MOCK_DELETION_REQUESTS.filter(req => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (typeFilter !== 'all' && req.type !== typeFilter) return false;
    if (searchQuery && !req.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !req.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: MOCK_DELETION_REQUESTS.length,
    pending: MOCK_DELETION_REQUESTS.filter(r => r.status === 'pending').length,
    processing: MOCK_DELETION_REQUESTS.filter(r => r.status === 'processing').length,
    completed: MOCK_DELETION_REQUESTS.filter(r => r.status === 'completed').length,
  };

  const handleProcess = () => {
    setTimeout(() => setShowProcessDialog(false), 1500);
  };

  return (
    <>
      <div className="min-h-full space-y-8 pb-12">
        <PageHeader
          title="Protection des données"
          description="Gestion des demandes RGPD et conformité à la loi camerounaise n° 2024/017"
          breadcrumbs={[
            { label: 'Conformité' },
            { label: 'Protection des données' },
          ]}
        />

        {/* Alert Banner */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Loi camerounaise n° 2024/017 du 23 décembre 2024</p>
            <p className="mt-0.5 text-amber-700/80 dark:text-amber-400/80 text-xs">
              La période transitoire a expiré le 23 juin 2026. Les obligations suivantes sont applicables :
              consentement parental si moins de 16 ans (selon le seuil retenu), autorisation préalable de l&apos;APDP,
              et contrôle des transferts de données hors territoire national.
            </p>
          </div>
        </motion.div>

        {/* KPI Strip */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'En attente', value: stats.pending, icon: <Clock className="h-5 w-5" />, bg: 'bg-amber-500/10', color: 'text-amber-500', onClick: () => { setStatusFilter('pending'); setActiveTab('requests'); } },
            { label: 'En cours', value: stats.processing, icon: <Loader2 className="h-5 w-5" />, bg: 'bg-blue-500/10', color: 'text-blue-500', onClick: () => { setStatusFilter('processing'); setActiveTab('requests'); } },
            { label: 'Terminés', value: stats.completed, icon: <CheckCircle className="h-5 w-5" />, bg: 'bg-emerald-500/10', color: 'text-emerald-500', onClick: () => { setStatusFilter('completed'); setActiveTab('requests'); } },
            { label: 'Total', value: stats.total, icon: <FileText className="h-5 w-5" />, bg: 'bg-primary/10', color: 'text-primary', onClick: () => { setStatusFilter('all'); setActiveTab('requests'); } },
          ].map((kpi) => (
            <motion.button key={kpi.label} variants={fadeUp} onClick={kpi.onClick}
              className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm text-left transition-colors hover:border-border/70">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums">{kpi.value}</p>
                </div>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ml-3', kpi.bg, kpi.color)}>
                  {kpi.icon}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/40">
            <TabsTrigger value="requests">Demandes</TabsTrigger>
            <TabsTrigger value="retention">Rétention</TabsTrigger>
            <TabsTrigger value="compliance">Conformité</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b border-border/40 p-4">
                <p className="font-semibold text-sm">Demandes des utilisateurs</p>
                <div className="flex items-center gap-2">
                  <div className="relative w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nom, email..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select items={TYPE_FILTER_ITEMS} value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="account_deletion">Suppression</SelectItem>
                      <SelectItem value="data_export">Export</SelectItem>
                      <SelectItem value="right_to_be_forgotten">Oubli</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select items={STATUS_FILTER_ITEMS} value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="processing">En cours</SelectItem>
                      <SelectItem value="completed">Terminés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 bg-muted/30">
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
                    <TableRow key={req.id} className="border-border/40 hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium">{req.userName}</p>
                          <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('gap-1 border-0', TYPE_CONFIG[req.type].color)}>
                          {TYPE_CONFIG[req.type].icon}
                          {TYPE_CONFIG[req.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{req.reason || '-'}</TableCell>
                      <TableCell>
                        <p>{new Date(req.createdAt).toLocaleDateString('fr-FR')}</p>
                        {req.processedAt && (
                          <p className="text-xs text-muted-foreground">
                            Traité le {new Date(req.processedAt).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('gap-1 border-0', STATUS_CONFIG[req.status].color)}>
                          {STATUS_CONFIG[req.status].icon}
                          {STATUS_CONFIG[req.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedRequest(req)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {req.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => { setSelectedRequest(req); setShowProcessDialog(true); }}>
                                Traiter
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600" onClick={() => { setSelectedRequest(req); setShowRejectDialog(true); }}>
                                Rejeter
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                        <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                        Aucune demande ne correspond à cette recherche.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3">
              {RETENTION_POLICIES.map((policy) => (
                <motion.div key={policy.label} variants={rowItem}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', policy.color)}>
                      {policy.icon}
                    </div>
                    <div>
                      <p className="font-semibold">{policy.label}</p>
                      <p className="text-sm text-muted-foreground">{policy.desc}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline">{policy.duration}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{policy.note}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3">
              {COMPLIANCE_ITEMS.map((item) => (
                <motion.div key={item.label} variants={rowItem}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      item.status === 'ok' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    )}>
                      {item.status === 'ok' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Badge className={cn(
                    'border-0 shrink-0',
                    item.status === 'ok'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  )}>
                    {item.status === 'ok' ? 'Conforme' : 'À vérifier'}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Process Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traiter la demande</DialogTitle>
            <DialogDescription>
              {selectedRequest?.type === 'data_export' ? 'Export des données utilisateur' :
               selectedRequest?.type === 'account_deletion' ? 'Suppression du compte utilisateur' :
               'Suppression complète des données utilisateur'}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted/40 border border-border/40 p-3 text-sm">
                <p className="font-medium">{selectedRequest.userName}</p>
                <p className="text-muted-foreground">{selectedRequest.userEmail}</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300">
                <p className="font-medium">Action à effectuer</p>
                <p className="mt-1">
                  {selectedRequest.type === 'data_export' && 'Un fichier ZIP contenant toutes les données personnelles sera généré et envoyé par email.'}
                  {selectedRequest.type === 'account_deletion' && 'Le compte sera désactivé et les données personnelles seront anonymisées après 30 jours.'}
                  {selectedRequest.type === 'right_to_be_forgotten' && 'Toutes les données seront définitivement supprimées, y compris les sauvegardes sous 90 jours.'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleProcess}>
              Confirmer le traitement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet. L&apos;utilisateur sera notifié.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Motif du rejet</Label>
            <Textarea
              id="reject-reason"
              placeholder="Ex: Demande incomplète, pièces justificatives manquantes..."
              className="mt-2"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => setShowRejectDialog(false)}>
              Rejeter la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest && !showProcessDialog && !showRejectDialog} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Utilisateur</p>
                  <p className="font-medium">{selectedRequest.userName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedRequest.userEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <Badge className={cn('gap-1 mt-1 border-0', TYPE_CONFIG[selectedRequest.type].color)}>
                    {TYPE_CONFIG[selectedRequest.type].icon}
                    {TYPE_CONFIG[selectedRequest.type].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Statut</p>
                  <Badge className={cn('gap-1 mt-1 border-0', STATUS_CONFIG[selectedRequest.status].color)}>
                    {STATUS_CONFIG[selectedRequest.status].icon}
                    {STATUS_CONFIG[selectedRequest.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Date de création</p>
                  <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                {selectedRequest.processedBy && (
                  <div>
                    <p className="text-muted-foreground">Traité par</p>
                    <p className="font-medium">{selectedRequest.processedBy}</p>
                  </div>
                )}
              </div>
              {selectedRequest.reason && (
                <div className="border-t border-border/40 pt-4">
                  <p className="text-sm text-muted-foreground">Raison</p>
                  <p className="mt-1 text-sm">{selectedRequest.reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
