'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Upload, Download, FileText, CheckCircle, AlertTriangle,
  XCircle, Clock, BarChart2, Database, Users, BookOpen, Layers
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const IMPORT_HISTORY = [
  { id: 'i1', type: 'Utilisateurs élèves', filename: 'eleves_cm_jan2025.csv', rows: 1240, ok: 1215, warn: 18, err: 7, status: 'complete', date: '2025-01-14 09:12', user: 'admin@piq.cm' },
  { id: 'i2', type: 'Contenu académique', filename: 'contenu_maths_term.json', rows: 87, ok: 87, warn: 0, err: 0, status: 'complete', date: '2025-01-10 14:30', user: 'editor@piq.cm' },
  { id: 'i3', type: 'Utilisateurs élèves', filename: 'eleves_sn_batch2.csv', rows: 340, ok: 298, warn: 22, err: 20, status: 'partial', date: '2025-01-08 11:00', user: 'admin@piq.sn' },
  { id: 'i4', type: 'Abonnements', filename: 'abos_reconcile_dec.csv', rows: 520, ok: 0, warn: 0, err: 520, status: 'failed', date: '2024-12-30 16:45', user: 'admin@piq.cm' },
];

const EXPORT_PRESETS = [
  { id: 'e1', label: 'Utilisateurs élèves', icon: <Users className="h-5 w-5 text-blue-500" />, formats: ['CSV', 'Excel', 'JSON'], desc: 'Comptes actifs, suspendus et archivés avec métadonnées.' },
  { id: 'e2', label: 'Contenu académique', icon: <BookOpen className="h-5 w-5 text-violet-500" />, formats: ['JSON', 'ZIP'], desc: 'Arborescence complète : matières, chapitres, ressources.' },
  { id: 'e3', label: 'Transactions & paiements', icon: <BarChart2 className="h-5 w-5 text-emerald-500" />, formats: ['CSV', 'Excel'], desc: 'Historique des paiements Mobile Money avec statut de réconciliation.' },
  { id: 'e4', label: 'Arbre académique', icon: <Layers className="h-5 w-5 text-amber-500" />, formats: ['JSON', 'CSV'], desc: 'Pays, sections, enseignements, cycles, classes, séries.' },
  { id: 'e5', label: 'Audit log', icon: <Database className="h-5 w-5 text-rose-500" />, formats: ['CSV', 'JSON'], desc: 'Journal complet des actions administrateur avec horodatage.' },
];

const IMPORT_TYPE_LABELS: Record<string, string> = {
  users: 'Utilisateurs élèves',
  content: 'Contenu académique',
  subscriptions: 'Abonnements',
  nodes: 'Arbre académique',
};

const STATUS_MAP = {
  complete: { label: 'Terminé', icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  partial: { label: 'Partiel', icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  failed: { label: 'Échoué', icon: <XCircle className="h-4 w-4 text-red-500" />, badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  pending: { label: 'En cours', icon: <Clock className="h-4 w-4 text-blue-500" />, badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
} as const;

function DropZone({ onFile }: { onFile?: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); onFile?.(f); }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors
        ${dragging ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50 hover:bg-muted/30'}
        ${file ? 'border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.csv,.json,.xlsx'; i.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) { setFile(f); onFile?.(f); } }; i.click(); }}
    >
      {file ? (
        <>
          <CheckCircle className="h-10 w-10 text-emerald-500 mb-3" />
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">{file.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} Ko — Prêt pour validation</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={e => { e.stopPropagation(); setFile(null); }}>Changer de fichier</Button>
        </>
      ) : (
        <>
          <Upload className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-semibold">Glissez-déposez votre fichier ici</p>
          <p className="text-xs text-muted-foreground mt-1">CSV, JSON ou Excel — max 50 Mo</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={e => e.stopPropagation()}>Parcourir</Button>
        </>
      )}
    </div>
  );
}

export default function ImportExportPage() {
  const [tab, setTab] = useState('import');
  const [importType, setImportType] = useState('');
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  const simulate = () => {
    setValidating(true);
    setTimeout(() => { setValidating(false); setValidated(true); }, 1800);
  };

  const totalImported = IMPORT_HISTORY.reduce((s, i) => s + i.ok, 0);
  const totalErrors = IMPORT_HISTORY.reduce((s, i) => s + i.err, 0);

  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader
        title="Import / Export"
        description="Importez des données en masse et exportez des rapports au format CSV, Excel ou JSON"
        breadcrumbs={[{ label: 'Système' }, { label: 'Import / Export' }]}
      />

      {/* KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Lignes importées (30j)', value: totalImported.toLocaleString(), icon: <Upload className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-500/10' },
          { label: 'Erreurs d\'import (30j)', value: totalErrors.toString(), icon: <XCircle className="h-5 w-5 text-rose-500" />, bg: 'bg-rose-500/10' },
          { label: 'Exports réalisés (30j)', value: '14', icon: <Download className="h-5 w-5 text-emerald-500" />, bg: 'bg-emerald-500/10' },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <Card className="border-border/40">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{kpi.label}</p><p className="mt-1.5 text-2xl font-bold">{kpi.value}</p></div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>{kpi.icon}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="import" className="gap-2"><Upload className="h-4 w-4" />Import</TabsTrigger>
          <TabsTrigger value="export" className="gap-2"><Download className="h-4 w-4" />Export</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* ── IMPORT ── */}
        <TabsContent value="import" className="space-y-5">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Importer des données</CardTitle>
              <CardDescription>Chaque import est validé avant insertion. Les erreurs n&apos;arrêtent pas l&apos;import — elles sont loguées et rapportées.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label>Type de données</Label>
                <Select items={IMPORT_TYPE_LABELS} value={importType} onValueChange={(v) => setImportType(v ?? '')}>
                  <SelectTrigger className="max-w-xs"><SelectValue placeholder="Choisir…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Utilisateurs élèves</SelectItem>
                    <SelectItem value="content">Contenu académique</SelectItem>
                    <SelectItem value="subscriptions">Abonnements</SelectItem>
                    <SelectItem value="nodes">Arbre académique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DropZone />
              {!validated && (
                <Button className="gap-2 w-full sm:w-auto" disabled={!importType || validating} onClick={simulate}>
                  {validating ? <><Clock className="h-4 w-4 animate-spin" />Validation en cours…</> : <><FileText className="h-4 w-4" />Valider le fichier</>}
                </Button>
              )}
              {validating && (
                <div className="space-y-2">
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-muted-foreground">Analyse en cours : vérification du format, déduplication, contrôle des références…</p>
                </div>
              )}
              {validated && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10 p-5 space-y-4">
                  <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-emerald-600" /><span className="font-semibold text-emerald-700 dark:text-emerald-400">Validation réussie — aperçu avant import</span></div>
                  <div className="grid grid-cols-3 gap-3">
                    {[['Lignes valides', '1 215', 'text-emerald-600'], ['Avertissements', '18', 'text-amber-600'], ['Erreurs', '7', 'text-red-600']].map(([l, v, c]) => (
                      <div key={l} className="rounded-lg border border-border/40 bg-background p-3 text-center">
                        <p className={`text-2xl font-bold ${c}`}>{v}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setValidated(false)}>Annuler</Button>
                    <Button className="gap-2" onClick={() => setValidated(false)}><Upload className="h-4 w-4" />Lancer l&apos;import (1 215 lignes)</Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── EXPORT ── */}
        <TabsContent value="export" className="space-y-4">
          {EXPORT_PRESETS.map((preset) => (
            <Card key={preset.id} className="border-border/40">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 flex-shrink-0">{preset.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{preset.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{preset.desc}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      {preset.formats.map(f => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {preset.formats.slice(0, 2).map(fmt => (
                      <Button key={fmt} variant="outline" size="sm" className="gap-1.5 h-8">
                        <Download className="h-3.5 w-3.5" />{fmt}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── HISTORY ── */}
        <TabsContent value="history">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Historique des imports</CardTitle>
              <CardDescription>Les 30 derniers jours — cliquez sur une ligne pour voir le rapport détaillé</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead>Fichier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Lignes</TableHead>
                    <TableHead>OK / ⚠ / ✗</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Par</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {IMPORT_HISTORY.map((h) => {
                    const s = STATUS_MAP[h.status as keyof typeof STATUS_MAP];
                    return (
                      <TableRow key={h.id} className="border-border/40 hover:bg-muted/30 cursor-pointer">
                        <TableCell className="font-mono text-xs text-muted-foreground max-w-[180px] truncate">{h.filename}</TableCell>
                        <TableCell className="text-sm">{h.type}</TableCell>
                        <TableCell className="text-sm">{h.rows.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="text-emerald-600 font-medium">{h.ok}</span>
                          {' / '}
                          <span className="text-amber-600">{h.warn}</span>
                          {' / '}
                          <span className="text-red-600">{h.err}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs gap-1 ${s.badge}`}>
                            {s.icon}{s.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{h.user}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{h.date}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
