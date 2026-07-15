'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, CreditCard as Edit, Trash2, ShoppingCart, Search, Lock, FileText, Shield, ChartBar as BarChart2, Eye, Download, MoveHorizontal as MoreHorizontal, History, TriangleAlert as AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const STORE_ITEMS = [
  { id: 's1', name: 'Cours complet – Terminale Mathématiques', class: 'Terminale', series: 'C, D', price: 2500, sales: 145, drm: true, active: true, format: 'PDF', pages: 120 },
  { id: 's2', name: 'Corrigé Bac 2024 – Physique-Chimie', class: 'Terminale', series: 'C, D', price: 1000, sales: 89, drm: true, active: true, format: 'PDF', pages: 48 },
  { id: 's3', name: 'Pack révision BEPC complet', class: '3ème', series: 'Toutes', price: 3500, sales: 234, drm: true, active: true, format: 'PDF', pages: 200 },
  { id: 's4', name: 'Annales Français – Terminale', class: 'Terminale', series: 'A4, C, D', price: 1500, sales: 67, drm: false, active: true, format: 'PDF', pages: 85 },
  { id: 's5', name: 'Guide méthodo – Dissertation', class: '2nde', series: 'Toutes', price: 800, sales: 12, drm: false, active: false, format: 'PDF', pages: 32 },
];

const RECENT_SALES = [
  { item: 'Cours complet – Terminale Mathématiques', buyer: 'Marie K.', date: '2024-12-10', amount: 2500 },
  { item: 'Corrigé Bac 2024 – Physique-Chimie', buyer: 'Jean N.', date: '2024-12-10', amount: 1000 },
  { item: 'Pack révision BEPC complet', buyer: 'Fatou D.', date: '2024-12-09', amount: 3500 },
  { item: 'Pack révision BEPC complet', buyer: 'Kofi A.', date: '2024-12-09', amount: 3500 },
  { item: 'Annales Français – Terminale', buyer: 'Aminata T.', date: '2024-12-08', amount: 1500 },
];

export default function StorePage() {
  const [search, setSearch] = useState('');
  const [itemOpen, setItemOpen] = useState(false);
  const [editItem, setEditItem] = useState<(typeof STORE_ITEMS)[0] | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('catalog');

  const totalSales = STORE_ITEMS.reduce((s, i) => s + i.sales, 0);
  const activeItems = STORE_ITEMS.filter((i) => i.active).length;

  const filtered = STORE_ITEMS.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.class.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader
        title="Boutique"
        description="Gérez les documents mis en vente et leurs paramètres de protection"
        breadcrumbs={[{ label: 'Commercial' }, { label: 'Boutique' }]}
        actions={
          <Button className="gap-2" onClick={() => { setEditItem(null); setItemOpen(true); }}>
            <Plus className="h-4 w-4" />Ajouter un document
          </Button>
        }
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Documents actifs', value: activeItems.toString(), icon: <Package className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-500/10' },
          { label: 'Ventes totales', value: totalSales.toString(), icon: <ShoppingCart className="h-5 w-5 text-emerald-500" />, bg: 'bg-emerald-500/10' },
          { label: 'Documents protégés DRM', value: STORE_ITEMS.filter((i) => i.drm).length.toString(), icon: <Shield className="h-5 w-5 text-violet-500" />, bg: 'bg-violet-500/10' },
          { label: 'Documents inactifs', value: STORE_ITEMS.filter((i) => !i.active).length.toString(), icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, bg: 'bg-amber-500/10' },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <Card className="border-border/40">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="catalog">Catalogue</TabsTrigger>
          <TabsTrigger value="sales">Ventes récentes</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par nom, classe…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <Card className="border-border/40">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead>Document</TableHead>
                    <TableHead>Classe / Série</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Ventes</TableHead>
                    <TableHead>DRM</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id} className="border-border/40 hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.format} · {item.pages} pages</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{item.class}</p>
                          <p className="text-xs text-muted-foreground">{item.series}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{item.price.toLocaleString('fr-FR')} FCFA</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{item.sales}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.drm
                          ? <Badge variant="outline" className="gap-1 text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"><Lock className="h-3 w-3" />Protégé</Badge>
                          : <Badge variant="outline" className="text-xs text-muted-foreground">Standard</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${item.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                          {item.active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => { setEditItem(item); setItemOpen(true); }}><Edit className="h-4 w-4" />Modifier</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2"><Eye className="h-4 w-4" />Voir les ventes</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2"><History className="h-4 w-4" />Historique prix</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => setDeleteConfirm(item.id)}><Trash2 className="h-4 w-4" />Retirer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base">Ventes récentes</CardTitle>
              <CardDescription>Les dernières transactions de la boutique</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40"><TableHead>Document</TableHead><TableHead>Acheteur</TableHead><TableHead>Date</TableHead><TableHead>Montant</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {RECENT_SALES.map((sale, i) => (
                    <TableRow key={i} className="border-border/40 hover:bg-muted/30">
                      <TableCell className="text-sm font-medium max-w-[260px] truncate">{sale.item}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{sale.buyer}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="font-semibold text-sm">{sale.amount.toLocaleString('fr-FR')} FCFA</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={itemOpen} onOpenChange={setItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Modifier le document' : 'Ajouter un document à la boutique'}</DialogTitle>
            <DialogDescription>Le document sera accessible à l&apos;achat pour les élèves de la classe sélectionnée.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Nom du document</Label><Input defaultValue={editItem?.name} placeholder="Ex : Cours complet Terminale Mathématiques" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Classe</Label>
                <Select defaultValue={editItem?.class}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent><SelectItem value="Terminale">Terminale</SelectItem><SelectItem value="3ème">3ème</SelectItem><SelectItem value="2nde">2nde</SelectItem><SelectItem value="1ère">1ère</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Prix (FCFA)</Label><Input type="number" defaultValue={editItem?.price} placeholder="2500" /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Fichier PDF</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                <Download className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Glisser-déposer ou cliquer pour sélectionner</p>
                <p className="text-xs text-muted-foreground mt-1">PDF uniquement, max 50 Mo</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
              <div>
                <p className="text-sm font-medium">Protection DRM</p>
                <p className="text-xs text-muted-foreground">Filigrane + blocage enregistrement écran</p>
              </div>
              <Switch defaultChecked={editItem?.drm ?? true} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
              <p className="text-sm font-medium">Document actif</p>
              <Switch defaultChecked={editItem?.active ?? true} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemOpen(false)}>Annuler</Button>
            <Button onClick={() => setItemOpen(false)}>{editItem ? 'Enregistrer' : 'Ajouter à la boutique'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer de la boutique ?</DialogTitle>
            <DialogDescription>Ce document ne sera plus accessible à l&apos;achat. Les élèves l&apos;ayant déjà acheté conservent leur accès.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => setDeleteConfirm(null)}>Retirer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
