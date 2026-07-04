'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { MOCK_RECONCILIATION } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  matched: { label: 'Correspondance', color: 'bg-emerald-100 text-emerald-700' },
  discrepancy: { label: 'Écart', color: 'bg-red-100 text-red-700' },
  resolved: { label: 'Résolu', color: 'bg-slate-100 text-slate-700' },
};

export default function ReconciliationPage() {
  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Réconciliation" description="Comparez les paiements avec les relevés agrégateur" breadcrumbs={[{ label: 'Commercial' }, { label: 'Réconciliation' }]} />
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">En attente</p><p className="text-2xl font-bold">{MOCK_RECONCILIATION.filter(r => r.status === 'pending').length}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Écarts détectés</p><p className="text-2xl font-bold text-red-600">{MOCK_RECONCILIATION.filter(r => r.status === 'discrepancy').length}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Correspondances</p><p className="text-2xl font-bold text-emerald-600">{MOCK_RECONCILIATION.filter(r => r.status === 'matched').length}</p></CardContent></Card>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réf. provider</TableHead>
                  <TableHead>Montant DB</TableHead>
                  <TableHead>Montant provider</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_RECONCILIATION.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.providerRef}</TableCell>
                    <TableCell>{item.dbAmount.toLocaleString()} FCFA</TableCell>
                    <TableCell>{item.providerAmount.toLocaleString()} FCFA</TableCell>
                    <TableCell>{item.userId}</TableCell>
                    <TableCell><Badge variant="outline" className={STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].color}>{STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].label}</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm">Confirmer</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
