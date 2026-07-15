'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Heart, Download, Plus, CreditCard as Edit, CircleCheck as CheckCircle, Clock, Circle as XCircle, Search, ListFilter as Filter, MoveHorizontal as MoreHorizontal, Eye, Receipt, FileText, Users, Target } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MOCK_DONATIONS } from '@/lib/mock-data';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const CAUSES = [
  { id: 'c1', name: 'Bourses élèves défavorisés', description: 'Aide aux élèves défavorisés au Cameroun', active: true, target: 500000, collected: 320000, donors: 48 },
  { id: 'c2', name: 'Développement contenu', description: 'Production de cours et exercices supplémentaires', active: true, target: 1500000, collected: 875000, donors: 102 },
  { id: 'c3', name: 'Formation enseignants', description: 'Formation pédagogique continue des enseignants', active: false, target: 300000, collected: 300000, donors: 35 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  completed: { label: 'Complété', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle className="h-3 w-3" /> },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
  failed: { label: 'Échoué', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
};

const STATUS_FILTER_ITEMS: Record<string, string> = {
  all: 'Tous les statuts',
  ...Object.fromEntries(Object.entries(STATUS_CONFIG).map(([value, { label }]) => [value, label])),
};

export default function DonationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [causeOpen, setCauseOpen] = useState(false);
  const [editCause, setEditCause] = useState<(typeof CAUSES)[0] | null>(null);
  const [activeTab, setActiveTab] = useState('donations');

  const totalCollected = MOCK_DONATIONS.filter((d) => d.status === 'completed').reduce((s, d) => s + d.amount, 0);
  const uniqueDonors = new Set(MOCK_DONATIONS.filter((d) => d.status === 'completed').map((d) => d.email)).size;
  const pendingCount = MOCK_DONATIONS.filter((d) => d.status === 'pending').length;

  const filtered = MOCK_DONATIONS.filter((d) => {
    const matchSearch = d.donorName.toLowerCase().includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader
        title="Dons & Soutien"
        description="Gérez les œuvres caritatives et suivez les dons reçus"
        breadcrumbs={[{ label: 'Commercial' }, { label: 'Dons & Soutien' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Exporter</Button>
            <Button className="gap-2" onClick={() => { setEditCause(null); setCauseOpen(true); }}>
              <Plus className="h-4 w-4" />Nouvelle cause
            </Button>
          </div>
        }
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total collecté (mois)', value: `${(totalCollected / 1000).toFixed(0)}K FCFA`, icon: <Heart className="h-5 w-5 text-rose-500" />, bg: 'bg-rose-500/10' },
          { label: 'Donateurs uniques', value: uniqueDonors.toString(), icon: <Users className="h-5 w-5 text-violet-500" />, bg: 'bg-violet-500/10' },
          { label: 'Causes actives', value: CAUSES.filter((c) => c.active).length.toString(), icon: <Target className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-500/10' },
          { label: 'En attente', value: pendingCount.toString(), icon: <Clock className="h-5 w-5 text-amber-500" />, bg: 'bg-amber-500/10' },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <Card className="border-border/40">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{kpi.label}</p>
                    <p className="mt-1.5 text-2xl font-bold tracking-tight">{kpi.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>{kpi.icon}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="donations">Historique des dons</TabsTrigger>
          <TabsTrigger value="causes">Causes caritatives</TabsTrigger>
        </TabsList>

        <TabsContent value="donations" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par donateur, email…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select items={STATUS_FILTER_ITEMS} value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-border/40">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead>Donateur</TableHead>
                    <TableHead>Cause</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Reçu</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => {
                    const s = STATUS_CONFIG[d.status];
                    return (
                      <TableRow key={d.id} className="border-border/40 hover:bg-muted/30">
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{d.donorName}</p>
                            <p className="text-xs text-muted-foreground">{d.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{d.cause}</TableCell>
                        <TableCell className="font-semibold">{d.amount.toLocaleString('fr-FR')} {d.currency}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{d.provider}</Badge></TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`gap-1 text-xs ${s.color}`}>
                            {s.icon}{s.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {d.receiptSent
                            ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="h-3.5 w-3.5" />Envoyé</span>
                            : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2"><Eye className="h-4 w-4" />Voir détails</DropdownMenuItem>
                              {d.status === 'completed' && !d.receiptSent && (
                                <DropdownMenuItem className="gap-2"><Receipt className="h-4 w-4" />Générer le reçu</DropdownMenuItem>
                              )}
                              {d.status === 'completed' && d.receiptSent && (
                                <DropdownMenuItem className="gap-2"><FileText className="h-4 w-4" />Renvoyer le reçu</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Heart className="h-10 w-10 mb-3 opacity-20" />
                  <p className="font-medium">Aucun don trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="causes" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAUSES.map((cause) => {
              const pct = Math.round((cause.collected / cause.target) * 100);
              return (
                <Card key={cause.id} className="border-border/40">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
                          <Heart className="h-4 w-4 text-rose-500" />
                        </div>
                        <Badge variant="outline" className={cause.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}>
                          {cause.active ? 'Active' : 'Terminée'}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditCause(cause); setCauseOpen(true); }}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <CardTitle className="text-base mt-2">{cause.name}</CardTitle>
                    <CardDescription className="text-xs">{cause.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">Collecté</span>
                          <span className="font-semibold">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{cause.collected.toLocaleString('fr-FR')} FCFA</span>
                        <span className="text-muted-foreground">/ {cause.target.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />{cause.donors} donateurs
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            <Card className="border-dashed border-border/40 cursor-pointer hover:border-rose-500/50 hover:bg-rose-500/5 transition-colors" onClick={() => { setEditCause(null); setCauseOpen(true); }}>
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm text-muted-foreground">Ajouter une cause</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={causeOpen} onOpenChange={setCauseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCause ? 'Modifier la cause' : 'Nouvelle cause caritative'}</DialogTitle>
            <DialogDescription>Les donateurs verront cette cause lors de leur don.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Nom de la cause</Label><Input defaultValue={editCause?.name} placeholder="Ex : Bourses élèves défavorisés" /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea defaultValue={editCause?.description} rows={3} placeholder="Décrivez l'objectif de cette cause…" /></div>
            <div className="space-y-1.5"><Label>Objectif de collecte (FCFA)</Label><Input type="number" defaultValue={editCause?.target} placeholder="500000" /></div>
            <div className="flex items-center justify-between">
              <Label>Cause active</Label>
              <Switch defaultChecked={editCause?.active ?? true} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCauseOpen(false)}>Annuler</Button>
            <Button onClick={() => setCauseOpen(false)}>{editCause ? 'Enregistrer' : 'Créer la cause'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
