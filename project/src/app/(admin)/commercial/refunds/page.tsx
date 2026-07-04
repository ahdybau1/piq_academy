'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { MOCK_REFUNDS } from '@/lib/mock-data';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approuvé', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700' },
};

export default function RefundsPage() {
  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Remboursements" description="Demandes de remboursement" breadcrumbs={[{ label: 'Commercial' }, { label: 'Remboursements' }]} />
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">En attente</p><p className="text-2xl font-bold text-amber-600">{MOCK_REFUNDS.filter(r => r.status === 'pending').length}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Approuvés</p><p className="text-2xl font-bold text-emerald-600">{MOCK_REFUNDS.filter(r => r.status === 'approved').length}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Rejetés</p><p className="text-2xl font-bold text-red-600">{MOCK_REFUNDS.filter(r => r.status === 'rejected').length}</p></CardContent></Card>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Délai</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_REFUNDS.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell className="font-medium">{refund.userName}</TableCell>
                    <TableCell>{refund.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell className="max-w-[300px] truncate">{refund.reason}</TableCell>
                    <TableCell>{refund.deadline}</TableCell>
                    <TableCell><Badge variant="outline" className={STATUS_CONFIG[refund.status as keyof typeof STATUS_CONFIG].color}>{STATUS_CONFIG[refund.status as keyof typeof STATUS_CONFIG].label}</Badge></TableCell>
                    <TableCell className="text-right">
                      {refund.status === 'pending' && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle className="h-4 w-4 mr-1" />Approuver</Button>
                          <Button size="sm" variant="destructive"><XCircle className="h-4 w-4 mr-1" />Rejeter</Button>
                        </div>
                      )}
                    </TableCell>
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
