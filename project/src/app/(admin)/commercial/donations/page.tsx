'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Heart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_DONATIONS } from '@/lib/mock-data';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  completed: { label: 'Complété', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  failed: { label: 'Échoué', color: 'bg-red-100 text-red-700' },
};

export default function DonationsPage() {
  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Dons" description="Historique des dons reçus" breadcrumbs={[{ label: 'Commercial' }, { label: 'Dons' }]} actions={<Button variant="outline"><Download className="h-4 w-4 mr-2" />Exporter</Button>} />
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total dons (mois)</p><p className="text-2xl font-bold">850K FCFA</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Donateurs</p><p className="text-2xl font-bold">{MOCK_DONATIONS.filter(d => d.status === 'completed').length}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Causes actives</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Donateur</TableHead><TableHead>Email</TableHead><TableHead>Montant</TableHead><TableHead>Cause</TableHead><TableHead>Statut</TableHead><TableHead>Date</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_DONATIONS.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-medium">{donation.donorName}</TableCell>
                    <TableCell>{donation.email}</TableCell>
                    <TableCell>{donation.amount.toLocaleString()} {donation.currency}</TableCell>
                    <TableCell>{donation.cause}</TableCell>
                    <TableCell><Badge variant="outline" className={STATUS_CONFIG[donation.status as keyof typeof STATUS_CONFIG].color}>{STATUS_CONFIG[donation.status as keyof typeof STATUS_CONFIG].label}</Badge></TableCell>
                    <TableCell>{new Date(donation.createdAt).toLocaleDateString('fr-FR')}</TableCell>
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
