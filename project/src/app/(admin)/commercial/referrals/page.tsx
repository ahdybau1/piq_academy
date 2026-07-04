'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gift, Users, TrendingUp } from 'lucide-react';
import { MOCK_REFERRALS } from '@/lib/mock-data';

export default function ReferralsPage() {
  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Parrainage" description="Configuration des récompenses et suivi des parrainages" breadcrumbs={[{ label: 'Commercial' }, { label: 'Parrainage' }]} />
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Parrainages actifs</p><p className="text-2xl font-bold">{MOCK_REFERRALS.length}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Taux de conversion</p><p className="text-2xl font-bold">34%</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Récompenses versées</p><p className="text-2xl font-bold">125K FCFA</p></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Configuration des récompenses</CardTitle><CardDescription>Récompense accordée au parrain</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Type de récompense</Label><select className="w-full rounded-md border bg-background px-3 py-2 text-sm"><option>Réduction abonnement</option><option>Crédit boutique</option></select></div>
              <div className="space-y-2"><Label>Valeur</Label><Input defaultValue="500 FCFA" /></div>
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Parrain</TableHead><TableHead>Filleul</TableHead><TableHead>Statut</TableHead><TableHead>Récompense</TableHead><TableHead>Date</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_REFERRALS.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell className="font-medium">{ref.referrerName}</TableCell>
                    <TableCell>{ref.referredName}</TableCell>
                    <TableCell><Badge variant="outline" className={ref.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>{ref.status === 'completed' ? 'Complété' : 'En attente'}</Badge></TableCell>
                    <TableCell>{ref.reward}</TableCell>
                    <TableCell>{new Date(ref.createdAt).toLocaleDateString('fr-FR')}</TableCell>
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
