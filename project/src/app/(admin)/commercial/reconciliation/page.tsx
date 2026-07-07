'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw, CheckCircle, AlertTriangle, Clock, Search,
  Eye, FileCheck, BarChart2, X,
} from 'lucide-react';
import { MOCK_RECONCILIATION } from '@/lib/mock-data';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const STATUS_CFG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
  matched: { label: 'Correspondance', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle className="h-3 w-3" /> },
  discrepancy: { label: 'Écart détecté', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <AlertTriangle className="h-3 w-3" /> },
  resolved: { label: 'Résolu', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: <FileCheck className="h-3 w-3" /> },
};

const OPERATOR_STATS = [
  { name: 'Orange Money', total: 312, matched: 298, discrepancy: 8, rate: '95.5%' },
  { name: 'MTN Mobile Money', total: 198, matched: 181, discrepancy: 12, rate: '91.4%' },
  { name: 'Express Union', total: 87, matched: 84, discrepancy: 2, rate: '96.6%' },
];

export default function ReconciliationPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState<(typeof MOCK_RECONCILIATION)[0] | null>(null);

  const counts = {
    all: MOCK_RECONCILIATION.length,
    pending: MOCK_RECONCILIATION.filter((i) => i.status === 'pending').length,
    discrepancy: MOCK_RECONCILIATION.filter((i) => i.status === 'discrepancy').length,
    matched: MOCK_RECONCILIATION.filter((i) => i.status === 'matched').length,
    resolved: MOCK_RECONCILIATION.filter((i) => i.status === 'resolved').length,
  };

  const filtered = MOCK_RECONCILIATION.filter((i) => {
    const matchSearch = i.providerRef.toLowerCase().includes(search.toLowerCase()) || i.userName.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'all' || i.status === tab;
    return matchSearch && matchTab;
  });

  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader
        title="Réconciliation Mobile Money"
        description="Rapprochez les paiements ambigus entre votre base de données et les relevés opérateurs"
        breadcrumbs={[{ label: 'Commercial' }, { label: 'Réconciliation' }]}
        actions={<Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" />Actualiser</Button>}
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'En attente', value: counts.pending.toString(), icon: <Clock className="h-5 w-5 text-amber-500" />, bg: 'bg-amber-500/10', alert: counts.pending > 0 },
          { label: 'Écarts détectés', value: counts.discrepancy.toString(), icon: <AlertTriangle className="h-5 w-5 text-red-500" />, bg: 'bg-red-500/10', alert: counts.discrepancy > 0 },
          { label: 'Correspondances OK', value: counts.matched.toString(), icon: <CheckCircle className="h-5 w-5 text-emerald-500" />, bg: 'bg-emerald-500/10' },
          { label: 'Résolus manuellement', value: counts.resolved.toString(), icon: <FileCheck className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-500/10' },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <Card className={`border-border/40 ${kpi.alert ? 'border-l-4 border-l-red-500' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{kpi.label}</p>
                    <p className="mt-1.5 text-2xl font-bold">{kpi.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>{kpi.icon}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><BarChart2 className="h-4 w-4" />Taux de succès par opérateur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {OPERATOR_STATS.map((op) => {
              const successPct = Math.round((op.matched / op.total) * 100);
              return (
                <div key={op.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{op.name}</span>
                    <span className="text-muted-foreground">{op.rate}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${successPct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{op.matched}/{op.total} transactions · {op.discrepancy} écarts</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Référence provider, utilisateur…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/40">
            {Object.entries(counts).map(([key, count]) => (
              <TabsTrigger key={key} value={key} className="gap-1.5">
                {{ all: 'Tous', pending: 'En attente', discrepancy: 'Écarts', matched: 'Correspondances', resolved: 'Résolus' }[key]}
                <Badge variant="secondary" className="text-xs h-4 min-w-4 px-1">{count}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            <Card className="border-border/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40">
                      <TableHead>Réf. provider</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Opérateur</TableHead>
                      <TableHead>Montant DB</TableHead>
                      <TableHead>Montant provider</TableHead>
                      <TableHead>Écart</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => {
                      const s = STATUS_CFG[item.status];
                      const diff = item.providerAmount - item.dbAmount;
                      return (
                        <TableRow key={item.id} className="border-border/40 hover:bg-muted/30">
                          <TableCell className="font-mono text-xs">{item.providerRef}</TableCell>
                          <TableCell className="text-sm font-medium">{item.userName}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{item.operator}</Badge></TableCell>
                          <TableCell className="text-sm">{item.dbAmount.toLocaleString()} FCFA</TableCell>
                          <TableCell className="text-sm">{item.providerAmount > 0 ? `${item.providerAmount.toLocaleString()} FCFA` : <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell>
                            {diff !== 0
                              ? <span className={`text-xs font-semibold ${diff > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{diff > 0 ? '+' : ''}{diff.toLocaleString()} FCFA</span>
                              : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`gap-1 text-xs ${s.color}`}>{s.icon}{s.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(item)}><Eye className="h-4 w-4" /></Button>
                              {(item.status === 'pending' || item.status === 'discrepancy') && (
                                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setSelected(item)}>Traiter</Button>
                              )}
                            </div>
                          </TableCell>
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

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Traitement manuel — {selected?.providerRef}</DialogTitle>
            <DialogDescription>Confirmez ou ajustez manuellement ce paiement après vérification du relevé opérateur.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2.5">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Utilisateur</span><span className="font-medium">{selected.userName}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Opérateur</span><span>{selected.operator}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Montant DB</span><span className="font-semibold">{selected.dbAmount.toLocaleString()} FCFA</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Montant provider</span><span className={`font-semibold ${selected.providerAmount !== selected.dbAmount ? 'text-red-600' : ''}`}>{selected.providerAmount > 0 ? `${selected.providerAmount.toLocaleString()} FCFA` : 'Non confirmé'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span>{new Date(selected.createdAt).toLocaleString('fr-FR')}</span></div>
              </div>
              <div className="space-y-1.5"><Label>Montant validé manuellement (FCFA)</Label><Input type="number" defaultValue={selected.dbAmount} /></div>
              <div className="space-y-1.5"><Label>Justification</Label><Textarea rows={3} placeholder="Expliquez la décision de validation manuelle…" /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Annuler</Button>
            <Button variant="destructive" className="gap-2" onClick={() => setSelected(null)}><X className="h-4 w-4" />Rejeter</Button>
            <Button className="gap-2" onClick={() => setSelected(null)}><FileCheck className="h-4 w-4" />Valider manuellement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
