'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Shield,
  UserX,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  FileText,
  Database,
  Loader2,
  Eye,
} from 'lucide-react';
import { MOCK_DELETION_REQUESTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { DataDeletionRequest } from '@/lib/types';

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  account_deletion: { label: 'Suppression de compte', color: 'bg-red-100 text-red-700', icon: <UserX className="h-4 w-4" /> },
  data_export: { label: 'Export de données', color: 'bg-blue-100 text-blue-700', icon: <Download className="h-4 w-4" /> },
  right_to_be_forgotten: { label: 'Droit à l\'oubli', color: 'bg-violet-100 text-violet-700', icon: <Trash2 className="h-4 w-4" /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-4 w-4" /> },
  processing: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
  completed: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4" /> },
};

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
      <div className="space-y-6">
        <PageHeader
          title="Protection des données"
          description="Gestion des demandes RGPD et conformité à la loi camerounaise n° 2024/017"
          breadcrumbs={[
            { label: 'Conformité' },
            { label: 'Protection des données' },
          ]}
        />

        {/* Alert Banner */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Loi camerounaise n° 2024/017 du 23 décembre 2024</p>
              <p className="text-amber-700 mt-1">
                La période transitoire a expiré le 23 juin 2026. Les obligations suivantes sont applicables :
                consentement parental si moins de 16 ans (selon le seuil retenu), autorisation préalable de l&apos;APDP,
                et contrôle des transferts de données hors territoire national.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setStatusFilter('pending'); setActiveTab('requests'); }}>
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
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setStatusFilter('processing'); setActiveTab('requests'); }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En cours</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                </div>
                <Loader2 className="h-8 w-8 text-blue-500/50 animate-spin" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setStatusFilter('completed'); setActiveTab('requests'); }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Terminés</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setStatusFilter('all'); setActiveTab('requests'); }}>
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="requests">Demandes</TabsTrigger>
            <TabsTrigger value="retention">Rétention</TabsTrigger>
            <TabsTrigger value="compliance">Conformité</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Demandes des utilisateurs</CardTitle>
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
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
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
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                      <TableRow key={req.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{req.userName}</p>
                            <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('gap-1', TYPE_CONFIG[req.type].color)}>
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
                          <Badge variant="outline" className={cn('gap-1', STATUS_CONFIG[req.status].color)}>
                            {STATUS_CONFIG[req.status].icon}
                            {STATUS_CONFIG[req.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(req)}>
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
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Politique de rétention des données</CardTitle>
                <CardDescription>
                  Configuration des durées de conservation par type de données
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Database className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Comptes utilisateurs</p>
                          <p className="text-sm text-muted-foreground">Données personnelles et profils</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">3 ans après inactivité</Badge>
                        <p className="text-xs text-muted-foreground mt-1">Suppression automatique</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-emerald-100">
                          <FileText className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">Historique pédagogique</p>
                          <p className="text-sm text-muted-foreground">Notes, progression, exercices</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">5 ans</Badge>
                        <p className="text-xs text-muted-foreground mt-1">Archivage puis suppression</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-amber-100">
                          <FileText className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">Transactions financières</p>
                          <p className="text-sm text-muted-foreground">Paiements, factures, remboursements</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">7 ans</Badge>
                        <p className="text-xs text-muted-foreground mt-1">Obligation légale</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-slate-100">
                          <Database className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium">Logs d&apos;accès</p>
                          <p className="text-sm text-muted-foreground">Connexions, journal d&apos;audit</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">2 ans</Badge>
                        <p className="text-xs text-muted-foreground mt-1">Anonymisation après 6 mois</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>État de conformité</CardTitle>
                <CardDescription>
                  Points de conformité à la loi 2024/017 sur la protection des données personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">Mentions légales</p>
                        <p className="text-sm text-muted-foreground">Informations sur le traitement des données</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">Conforme</Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">Autorisation APDP</p>
                        <p className="text-sm text-muted-foreground">Autorisation préalable de l&apos;Autorité de Protection des Données Personnelles</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">À vérifier</Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">Transfert hors Cameroun</p>
                        <p className="text-sm text-muted-foreground">Hébergement Supabase situé hors du territoire national</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">À vérifier</Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">Droit à l&apos;oubli</p>
                        <p className="text-sm text-muted-foreground">Procédure de suppression de données implémentée</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">Conforme</Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">Export de données</p>
                        <p className="text-sm text-muted-foreground">Portabilité des données personnelles</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">Conforme</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              <div className="rounded-lg bg-slate-50 border p-3 text-sm">
                <p className="font-medium">{selectedRequest.userName}</p>
                <p className="text-muted-foreground">{selectedRequest.userEmail}</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
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
        <DialogContent className="max-w-lg">
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
                  <Badge variant="outline" className={cn('gap-1 mt-1', TYPE_CONFIG[selectedRequest.type].color)}>
                    {TYPE_CONFIG[selectedRequest.type].icon}
                    {TYPE_CONFIG[selectedRequest.type].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Statut</p>
                  <Badge variant="outline" className={cn('gap-1 mt-1', STATUS_CONFIG[selectedRequest.status].color)}>
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
                <div className="border-t pt-4">
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
