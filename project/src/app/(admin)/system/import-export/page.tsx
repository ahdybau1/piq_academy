'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileDown, Upload, Download, FileText, CheckCircle } from 'lucide-react';

export default function ImportExportPage() {
  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Import/Export" description="Importez ou exportez des données en masse" breadcrumbs={[{ label: 'Système' }, { label: 'Import/Export' }]} />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Import de données</CardTitle><CardDescription>Importez des données depuis un fichier CSV ou Excel</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Glissez-déposez votre fichier ici</p>
                <p className="text-xs text-muted-foreground">CSV, XLS, ou XLSX (max 10MB)</p>
                <Button variant="outline" className="mt-4">Sélectionner un fichier</Button>
              </div>
              <div className="space-y-2">
                <Label>Type de données à importer</Label>
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option>Utilisateurs</option>
                  <option>Contenu pédagogique</option>
                  <option>Établissements</option>
                  <option>Examens officiels</option>
                </select>
              </div>
              <Button className="w-full">Lancer l'import</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Export de données</CardTitle><CardDescription>Exportez des données pour sauvegarde ou audit</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border"><div><p className="font-medium">Utilisateurs</p><p className="text-xs text-muted-foreground">Tous les comptes utilisateurs</p></div><Button variant="outline" size="sm"><FileDown className="h-4 w-4 mr-1" />Exporter</Button></div>
                <div className="flex items-center justify-between p-3 rounded-lg border"><div><p className="font-medium">Transactions</p><p className="text-xs text-muted-foreground">Historique des paiements</p></div><Button variant="outline" size="sm"><FileDown className="h-4 w-4 mr-1" />Exporter</Button></div>
                <div className="flex items-center justify-between p-3 rounded-lg border"><div><p className="font-medium">Contenu pédagogique</p><p className="text-xs text-muted-foreground">Cours, exercices, examens</p></div><Button variant="outline" size="sm"><FileDown className="h-4 w-4 mr-1" />Exporter</Button></div>
                <div className="flex items-center justify-between p-3 rounded-lg border"><div><p className="font-medium">Journal d'audit</p><p className="text-xs text-muted-foreground">Actions administratives</p></div><Button variant="outline" size="sm"><FileDown className="h-4 w-4 mr-1" />Exporter</Button></div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Imports récents</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"><FileText className="h-4 w-4 text-muted-foreground" /><div className="flex-1"><p className="text-sm font-medium">utilisateurs_nov2024.csv</p><p className="text-xs text-muted-foreground">1,250 lignes importées</p></div><Badge className="bg-emerald-600"><CheckCircle className="h-3 w-3 mr-1" />Réussi</Badge></div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"><FileText className="h-4 w-4 text-muted-foreground" /><div className="flex-1"><p className="text-sm font-medium">contenu_math.xlsx</p><p className="text-xs text-muted-foreground">45 cours importés</p></div><Badge className="bg-emerald-600"><CheckCircle className="h-3 w-3 mr-1" />Réussi</Badge></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
