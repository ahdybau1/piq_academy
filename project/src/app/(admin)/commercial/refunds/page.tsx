'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock, CheckCircle, XCircle, Search, Eye,
  CreditCard, User,
} from 'lucide-react';
import { MOCK_REFUNDS } from '@/lib/mock-data';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const STATUS_CFG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'Approuvé', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
};

const PRIORITY_CFG: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const NOW = Date.now();

export default function RefundsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('pending');
  const [selected, setSelected] = useState<(typeof MOCK_REFUNDS)[0] | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const counts = {
    pending: MOCK_REFUNDS.filter((r) => r.status === 'pending').length,
    approved: MOCK_REFUNDS.filter((r) => r.status === 'approved').length,
    rejected: MOCK_REFUNDS.filter((r) => r.status === 'rejected').length,
  };

  const filtered = MOCK_REFUNDS.filter((r) => {
    const matchSearch = r.userName.toLowerCase().includes(search.toLowerCase()) || r.transactionId.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'all' || r.status === tab;
    return matchSearch && matchTab;
  });

  const totalPending = MOCK_REFUNDS.filter((r) => r.status === 'pending').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader
        title="Remboursements"
        description="Traitez les demandes de remboursement des utilisateurs"
        breadcrumbs={[{ label: 'Commercial' }, { label: 'Remboursements' }]}
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'En attente de traitement', value: counts.pending.toString(), sub: `${totalPending.toLocaleString()} FCFA à traiter`, icon: <Clock className="h-5 w-5 text-amber-500" />, bg: 'bg-amber-500/10', alert: counts.pending > 0 },
          { label: 'Approuvés (mois)', value: counts.approved.toString(), icon: <CheckCircle className="h-5 w-5 text-emerald-500" />, bg: 'bg-emerald-500/10' },
          { label: 'Rejetés (mois)', value: counts.rejected.toString(), icon: <XCircle className="h-5 w-5 text-slate-500" />, bg: 'bg-slate-500/10' },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <Card className={`border-border/40 ${kpi.alert ? 'border-l-4 border-l-amber-500' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{kpi.label}</p>
                    <p className="mt-1.5 text-2xl font-bold">{kpi.value}</p>
                    {kpi.sub && <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>}
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>{kpi.icon}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Nom utilisateur, référence transaction…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/40">
            <TabsTrigger value="pending" className="gap-1.5">
              En attente <Badge variant="secondary" className="text-xs h-4 min-w-4 px-1">{counts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">Approuvés</TabsTrigger>
            <TabsTrigger value="rejected">Rejetés</TabsTrigger>
            <TabsTrigger value="all">Tous</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            <Card className="border-border/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40">
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Délai</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => {
                      const s = STATUS_CFG[r.status];
                      const daysLeft = Math.ceil((new Date(r.deadline).getTime() - NOW) / 86400000);
                      return (
                        <TableRow key={r.id} className="border-border/40 hover:bg-muted/30">
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{r.userName}</p>
                              <p className="text-xs text-muted-foreground">{r.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{r.amount.toLocaleString()} FCFA</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{r.subscriptionType}</Badge></TableCell>
                          <TableCell className="max-w-[200px]"><p className="text-xs text-muted-foreground truncate">{r.reason}</p></TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${PRIORITY_CFG[r.priority]}`}>
                              {{ high: 'Haute', medium: 'Moyenne', low: 'Basse' }[r.priority]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {r.status === 'pending' && (
                              <span className={`text-xs font-medium ${daysLeft <= 2 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                {daysLeft > 0 ? `${daysLeft}j restant` : 'Expiré'}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`gap-1 text-xs ${s.color}`}>{s.icon}{s.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {r.status === 'pending' ? (
                              <div className="flex justify-end gap-1">
                                <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1" onClick={() => { setSelected(r); setAction('approve'); }}>
                                  <CheckCircle className="h-3.5 w-3.5" />Approuver
                                </Button>
                                <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => { setSelected(r); setAction('reject'); }}>
                                  <XCircle className="h-3.5 w-3.5" />Rejeter
                                </Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(r)}><Eye className="h-4 w-4" /></Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <CheckCircle className="h-10 w-10 mb-3 opacity-20" />
                    <p className="font-medium">Aucune demande dans cette catégorie</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selected && !!action} onOpenChange={() => { setSelected(null); setAction(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === 'approve' ? <><CheckCircle className="h-5 w-5 text-emerald-500" />Approuver le remboursement</> : <><XCircle className="h-5 w-5 text-red-500" />Rejeter la demande</>}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm"><User className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{selected.userName}</span></div>
                <div className="flex items-center gap-2 text-sm"><CreditCard className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-semibold">{selected.amount.toLocaleString()} FCFA</span></div>
                <p className="text-xs text-muted-foreground">{selected.reason}</p>
              </div>
              {action === 'reject' && (
                <div className="space-y-1.5">
                  <Label>Motif du rejet <span className="text-destructive">*</span></Label>
                  <Textarea rows={3} placeholder="Expliquez pourquoi la demande est rejetée (envoyé à l'utilisateur)…" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                </div>
              )}
              {action === 'approve' && (
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>Le remboursement de <strong>{selected.amount.toLocaleString()} FCFA</strong> sera initié vers {selected.email}. L&apos;utilisateur recevra une notification automatique.</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelected(null); setAction(null); }}>Annuler</Button>
            <Button
              variant={action === 'reject' ? 'destructive' : 'default'}
              className={action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => { setSelected(null); setAction(null); }}
            >
              {action === 'approve' ? 'Confirmer le remboursement' : 'Confirmer le rejet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
