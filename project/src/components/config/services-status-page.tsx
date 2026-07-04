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
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  AlertCircle,
  DollarSign,
  Brain,
  Activity,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { MOCK_EXTERNAL_SERVICES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { ExternalService } from '@/lib/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  online: { label: 'En ligne', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: <CheckCircle className="h-4 w-4" /> },
  offline: { label: 'Hors ligne', color: 'text-red-700', bgColor: 'bg-red-100', icon: <AlertCircle className="h-4 w-4" /> },
  degraded: { label: 'Dégradé', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: <AlertTriangle className="h-4 w-4" /> },
  unknown: { label: 'Inconnu', color: 'text-slate-700', bgColor: 'bg-slate-100', icon: <Clock className="h-4 w-4" /> },
};

export default function ServicesStatusPage() {
  const [selectedService, setSelectedService] = useState<ExternalService | null>(null);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const paymentServices = MOCK_EXTERNAL_SERVICES.filter(s => s.type === 'payment');
  const aiServices = MOCK_EXTERNAL_SERVICES.filter(s => s.type === 'ai');

  const totalOnline = MOCK_EXTERNAL_SERVICES.filter(s => s.status === 'online').length;
  const totalDegraded = MOCK_EXTERNAL_SERVICES.filter(s => s.status === 'degraded').length;
  const totalOffline = MOCK_EXTERNAL_SERVICES.filter(s => s.status === 'offline').length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setShowRefreshDialog(false);
    }, 2000);
  };

  const formatBytes = (bytes: number) => `${(bytes / 1000).toFixed(0)}K`;

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="État des services externes"
          description="Surveillance en temps réel des agrégateurs de paiement et API IA"
          breadcrumbs={[
            { label: 'Configuration' },
            { label: 'Services externes' },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className={cn('gap-1', totalOffline > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800')}>
              {totalOffline > 0 ? <AlertCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
              {totalOnline} en ligne - {totalDegraded} dégradé(s) - {totalOffline} hors ligne
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowRefreshDialog(true)} disabled={isRefreshing}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
            Rafraîchir l&apos;état
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Payment Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Agrégateurs de paiement
              </CardTitle>
              <CardDescription>
                État des connexions aux fournisseurs de paiement mobile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn('p-2 rounded-lg', STATUS_CONFIG[service.status].bgColor)}>
                        <Server className={cn('h-5 w-5', STATUS_CONFIG[service.status].color)} />
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Temps de réponse</p>
                        <p className={cn(
                          'font-medium',
                          service.responseTime! > 1000 ? 'text-amber-600' : 'text-emerald-600'
                        )}>
                          {service.responseTime}ms
                        </p>
                      </div>
                      <Badge variant="outline" className={cn(STATUS_CONFIG[service.status].bgColor, STATUS_CONFIG[service.status].color, 'gap-1')}>
                        {STATUS_CONFIG[service.status].icon}
                        {STATUS_CONFIG[service.status].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                API Intelligence Artificielle
              </CardTitle>
              <CardDescription>
                État et quotas des fournisseurs IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiServices.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-lg border p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={cn('p-2 rounded-lg', STATUS_CONFIG[service.status].bgColor)}>
                          <Brain className={cn('h-5 w-5', STATUS_CONFIG[service.status].color)} />
                        </div>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.provider}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(STATUS_CONFIG[service.status].bgColor, STATUS_CONFIG[service.status].color, 'gap-1')}>
                        {STATUS_CONFIG[service.status].icon}
                        {STATUS_CONFIG[service.status].label}
                      </Badge>
                    </div>
                    {service.quotaUsed !== undefined && service.quotaLimit !== undefined && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Quota utilisé</span>
                          <span className="font-medium">
                            {formatBytes(service.quotaUsed)} / {formatBytes(service.quotaLimit)} tokens
                          </span>
                        </div>
                        <Progress
                          value={(service.quotaUsed / service.quotaLimit) * 100}
                          className={cn(
                            'h-2',
                            (service.quotaUsed / service.quotaLimit) > 0.9 ? '[&>div]:bg-red-500' :
                            (service.quotaUsed / service.quotaLimit) > 0.75 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'
                          )}
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{((service.quotaUsed / service.quotaLimit) * 100).toFixed(1)}% utilisé</span>
                          <span>Réinitialisation: {service.quotaResetDate}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Dernières erreurs
            </CardTitle>
            <CardDescription>
              Historique des erreurs récentes sur les services externes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Erreur</TableHead>
                  <TableHead>Date/Heure</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_EXTERNAL_SERVICES.filter(s => s.lastError).map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="text-red-600">{service.lastError}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {service.lastErrorAt ? new Date(service.lastErrorAt).toLocaleString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        En investigation
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {MOCK_EXTERNAL_SERVICES.filter(s => s.lastError).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                      Aucune erreur récente
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cost Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Coûts cumulés
            </CardTitle>
            <CardDescription>
              Suivi des dépenses API par fournisseur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Jour en cours</p>
                <p className="text-2xl font-bold">12.45 EUR</p>
                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.2% vs hier
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Mois en cours</p>
                <p className="text-2xl font-bold">245.80 EUR</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  -5.1% vs mois dernier
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Répartition</p>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Claude (Anthropic)</span>
                    <span className="font-medium">180 EUR</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Gemini (Google)</span>
                    <span className="font-medium">65.80 EUR</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Detail Dialog */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedService?.type === 'payment' ? <DollarSign className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
              {selectedService?.name}
            </DialogTitle>
            <DialogDescription>
              Détails du service - {selectedService?.provider}
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                <Badge variant="outline" className={cn(STATUS_CONFIG[selectedService.status].bgColor, STATUS_CONFIG[selectedService.status].color, 'gap-1')}>
                  {STATUS_CONFIG[selectedService.status].icon}
                  {STATUS_CONFIG[selectedService.status].label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Dernière vérification</span>
                <span className="font-medium">{new Date(selectedService.lastCheck).toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Temps de réponse</span>
                <span className={cn(
                  'font-medium',
                  selectedService.responseTime! > 1000 ? 'text-amber-600' : 'text-emerald-600'
                )}>
                  {selectedService.responseTime}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taux d&apos;erreur</span>
                <span className={cn(
                  'font-medium',
                  selectedService.errorRate! > 0.05 ? 'text-red-600' :
                  selectedService.errorRate! > 0.02 ? 'text-amber-600' : 'text-emerald-600'
                )}>
                  {(selectedService.errorRate! * 100).toFixed(2)}%
                </span>
              </div>
              {selectedService.type === 'ai' && selectedService.quotaUsed !== undefined && (
                <>
                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Quota</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilisé</span>
                        <span>{formatBytes(selectedService.quotaUsed!)} / {formatBytes(selectedService.quotaLimit!)} tokens</span>
                      </div>
                      <Progress value={(selectedService.quotaUsed! / selectedService.quotaLimit!) * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Reste: {formatBytes(selectedService.quotaLimit! - selectedService.quotaUsed!)} tokens</span>
                        <span>Reset: {selectedService.quotaResetDate}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {selectedService.lastError && (
                <div className="border-t pt-4">
                  <p className="font-medium mb-2 text-red-600">Dernière erreur</p>
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    <p>{selectedService.lastError}</p>
                    <p className="text-xs text-red-500 mt-1">
                      {selectedService.lastErrorAt && new Date(selectedService.lastErrorAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refresh Dialog */}
      <Dialog open={showRefreshDialog} onOpenChange={setShowRefreshDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rafraîchir l&apos;état des services</DialogTitle>
            <DialogDescription>
              Vérification de l&apos;état de tous les services externes...
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefreshDialog(false)} disabled={isRefreshing}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
