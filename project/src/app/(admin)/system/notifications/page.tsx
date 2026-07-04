'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Edit, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const TEMPLATES = [
  { event: 'Expiration abonnement', channels: ['email', 'push'], active: true },
  { event: 'Remboursement approuvé', channels: ['email', 'sms'], active: true },
  { event: 'Nouveau contenu publié', channels: ['push'], active: false },
  { event: 'Rappel examen blanc', channels: ['email', 'sms', 'push'], active: true },
];

export default function NotificationsPage() {
  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Notifications" description="Bibliothèque de templates par événement" breadcrumbs={[{ label: 'Système' }, { label: 'Notifications' }]} />
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Templates actifs</p><p className="text-2xl font-bold">{TEMPLATES.filter(t => t.active).length}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Envoyés (mois)</p><p className="text-2xl font-bold">45,230</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Taux d'ouverture</p><p className="text-2xl font-bold">67%</p></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Templates de notification</CardTitle><CardDescription>Un template par événement système</CardDescription></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Événement</TableHead><TableHead>Canaux</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {TEMPLATES.map((t, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{t.event}</TableCell>
                    <TableCell><div className="flex gap-1">{t.channels.map((c, i) => (<Badge key={i} variant="outline" className="text-xs">{c}</Badge>))}</div></TableCell>
                    <TableCell><Switch checked={t.active} /></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm"><Edit className="h-4 w-4 mr-1" />Modifier</Button></TableCell>
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
