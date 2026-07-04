'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Plus, Edit } from 'lucide-react';

const CATALOG_ITEMS = [
  { id: 'cat1', name: 'Définition', description: 'Explication d\'un concept clé', count: 2450 },
  { id: 'cat2', name: 'Théorème', description: 'Proposition mathématique démontrée', count: 320 },
  { id: 'cat3', name: 'Exemple', description: 'Illustration d\'un concept', count: 1890 },
  { id: 'cat4', name: 'Exercice type', description: 'Modèle d\'exercice résolu', count: 750 },
  { id: 'cat5', name: 'Formule', description: 'Formule mathématique ou physique', count: 420 },
];

export default function AICatalogPage() {
  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Catalogue pédagogique" description="Types d'éléments pédagogiques gérés par l'IA" breadcrumbs={[{ label: 'Intelligence Artificielle' }, { label: 'Catalogue' }]} actions={<Button><Plus className="h-4 w-4 mr-2" />Nouveau type</Button>} />
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Types d'éléments</p><p className="text-2xl font-bold">{CATALOG_ITEMS.length}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Éléments générés</p><p className="text-2xl font-bold">{CATALOG_ITEMS.reduce((acc, i) => acc + i.count, 0).toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Matières couvertes</p><p className="text-2xl font-bold">7</p></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Types d'éléments pédagogiques</CardTitle><CardDescription>Liste des types utilisés pour la génération de contenu</CardDescription></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Nom</TableHead><TableHead>Description</TableHead><TableHead>Éléments</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {CATALOG_ITEMS.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.description}</TableCell>
                    <TableCell><Badge variant="outline">{item.count.toLocaleString()}</Badge></TableCell>
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
