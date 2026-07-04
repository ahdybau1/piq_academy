'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Edit } from 'lucide-react';

const STORE_ITEMS = [
  { id: 's1', name: 'Cours complet - Terminale Mathématiques', class: 'Terminale', price: 2500, sales: 145 },
  { id: 's2', name: 'Corrigé Bac 2024 - Physique-Chimie', class: 'Terminale', price: 1000, sales: 89 },
  { id: 's3', name: 'Pack révision BEPC', class: '3ème', price: 3500, sales: 234 },
];

export default function StorePage() {
  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Boutique" description="Documents en vente par classe" breadcrumbs={[{ label: 'Commercial' }, { label: 'Boutique' }]} />
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Documents en vente</p><p className="text-2xl font-bold">{STORE_ITEMS.length}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Ventes (mois)</p><p className="text-2xl font-bold">{STORE_ITEMS.reduce((acc, i) => acc + i.sales, 0)}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Revenus</p><p className="text-2xl font-bold">1.2M FCFA</p></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Documents en vente</CardTitle><CardDescription>Liste des documents disponibles à l'achat</CardDescription></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Nom</TableHead><TableHead>Classe</TableHead><TableHead>Prix</TableHead><TableHead>Ventes</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {STORE_ITEMS.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="outline">{item.class}</Badge></TableCell>
                    <TableCell>{item.price.toLocaleString()} FCFA</TableCell>
                    <TableCell>{item.sales}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></TableCell>
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
