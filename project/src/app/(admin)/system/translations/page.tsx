'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Globe, Plus, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const LANGUAGES = [
  { code: 'fr', name: 'Français', native: 'Français', active: true, progress: 100 },
  { code: 'en', name: 'Anglais', native: 'English', active: true, progress: 85 },
  { code: 'ar', name: 'Arabe', native: 'العربية', active: false, progress: 20 },
];

const TRANSLATION_TASKS = [
  { contentType: 'lesson', id: 'L452', title: 'Équations du second degré', source: 'FR', target: 'EN', status: 'translated', translator: 'A. Diallo' },
  { contentType: 'exercise', id: 'E128', title: 'Factorisation', source: 'FR', target: 'EN', status: 'in_review', translator: 'O. Ba' },
  { contentType: 'ui', id: 'UI-001', title: 'Messages d\'erreur', source: 'FR', target: 'AR', status: 'draft', translator: null },
];

export default function TranslationsPage() {
  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Langues & Traductions" description="Configuration des langues et suivi des traductions" breadcrumbs={[{ label: 'Système' }, { label: 'Langues & Traductions' }]} />
        <Card>
          <CardHeader><CardTitle>Langues supportées</CardTitle><CardDescription>Liste des langues configurées</CardDescription></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Code</TableHead><TableHead>Nom</TableHead><TableHead>Progression</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {LANGUAGES.map((lang) => (
                  <TableRow key={lang.code}>
                    <TableCell className="font-mono">{lang.code}</TableCell>
                    <TableCell><div><p className="font-medium">{lang.name}</p><p className="text-xs text-muted-foreground">{lang.native}</p></div></TableCell>
                    <TableCell>{lang.progress}%</TableCell>
                    <TableCell><Switch checked={lang.active} /></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Tâches de traduction</CardTitle><CardDescription>Contenu en cours de traduction</CardDescription></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Type</TableHead><TableHead>Contenu</TableHead><TableHead>Source → Cible</TableHead><TableHead>Statut</TableHead><TableHead>Traducteur</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {TRANSLATION_TASKS.map((task, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Badge variant="outline">{task.contentType}</Badge></TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.source} → {task.target}</TableCell>
                    <TableCell><Badge variant="outline" className={task.status === 'translated' ? 'bg-emerald-50 text-emerald-700' : task.status === 'in_review' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50'}>{task.status === 'translated' ? 'Traduit' : task.status === 'in_review' ? 'En révision' : 'Brouillon'}</Badge></TableCell>
                    <TableCell>{task.translator || '-'}</TableCell>
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
