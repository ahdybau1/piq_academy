'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Megaphone, Plus, Edit, Trash2, Play, Pause, Eye, MousePointerClick,
  Shield, Ban, ExternalLink,
} from 'lucide-react';
import { MOCK_ADVERTISERS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { Advertiser } from '@/lib/types';

// ── Animations ─────────────────────────────────────────────────────────────
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } };
const fadeUp: Variants  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };
const rowItem: Variants = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } } };

// ── Config maps ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; color: string }> = {
  active:    { label: 'Actif',       color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  paused:    { label: 'En pause',    color: 'bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400'   },
  suspended: { label: 'Suspendu',    color: 'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400'     },
  pending:   { label: 'En attente',  color: 'bg-slate-100   text-slate-700   dark:bg-slate-800      dark:text-slate-400'   },
  completed: { label: 'Terminé',     color: 'bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-400'    },
};

const TYPE_CFG: Record<string, { label: string; color: string }> = {
  banner:       { label: 'Bannière',    color: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400'   },
  interstitial: { label: 'Interstitiel',color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  native:       { label: 'Natif',       color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

const FORBIDDEN = [
  { id: 'alcohol',        label: 'Alcool',             desc: 'Boissons alcoolisées' },
  { id: 'tobacco',        label: 'Tabac',              desc: 'Produits du tabac et e-cigarettes' },
  { id: 'pharmaceuticals',label: 'Médicaments',        desc: 'Médicaments sur ordonnance' },
  { id: 'gambling',       label: 'Jeux d\'argent',     desc: 'Casinos, paris sportifs, loteries' },
  { id: 'adult',          label: 'Contenu adulte',     desc: 'Contenu sexuellement explicite' },
  { id: 'weapons',        label: 'Armes',              desc: 'Armes à feu et explosifs' },
  { id: 'political',      label: 'Politique',          desc: 'Contenu politique partisan' },
  { id: 'hate',           label: 'Discours de haine',  desc: 'Contenu discriminatoire' },
];

// ── Component ───────────────────────────────────────────────────────────────
export default function AdvertisingPage() {
  const [tab, setTab]   = useState('advertisers');
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Advertiser | null>(null);

  const allCampaigns    = MOCK_ADVERTISERS.flatMap(a => a.campaigns);
  const totalImpressions = allCampaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks     = allCampaigns.reduce((s, c) => s + c.clicks, 0);
  const ctr             = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const activeCampaigns = allCampaigns.filter(c => c.status === 'active').length;

  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader
        title="Publicités"
        description="Gestion des annonceurs, campagnes et catégories interdites — palier gratuit uniquement."
        breadcrumbs={[{ label: 'Conformité' }, { label: 'Publicités' }]}
        actions={
          <Button size="sm" className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />Nouvel annonceur
          </Button>
        }
      />

      {/* Info banner */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
        <Shield className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Modération automatique active</p>
          <p className="mt-0.5 text-blue-700/80 dark:text-blue-400/80 text-xs">
            Les publicités ne sont visibles qu&apos;aux utilisateurs du palier gratuit. Toute campagne doit respecter les catégories interdites listées ci-dessous.
          </p>
        </div>
      </motion.div>

      {/* KPI Strip */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Annonceurs',
            value: MOCK_ADVERTISERS.length.toString(),
            sub: `${MOCK_ADVERTISERS.filter(a => a.status === 'active').length} actifs`,
            icon: <Megaphone className="h-5 w-5" />, bg: 'bg-primary/10', color: 'text-primary',
          },
          {
            label: 'Campagnes actives',
            value: activeCampaigns.toString(),
            sub: `/ ${allCampaigns.length} total`,
            icon: <Play className="h-5 w-5" />, bg: 'bg-emerald-500/10', color: 'text-emerald-500',
          },
          {
            label: 'Impressions (mois)',
            value: totalImpressions.toLocaleString('fr-FR'),
            sub: `${totalClicks.toLocaleString('fr-FR')} clics`,
            icon: <Eye className="h-5 w-5" />, bg: 'bg-blue-500/10', color: 'text-blue-500',
          },
          {
            label: 'CTR moyen',
            value: `${ctr}%`,
            sub: 'Taux de clic moyen',
            icon: <MousePointerClick className="h-5 w-5" />, bg: 'bg-amber-500/10', color: 'text-amber-500',
          },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}
            className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{kpi.sub}</p>
              </div>
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ml-3', kpi.bg, kpi.color)}>
                {kpi.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="advertisers">Annonceurs</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="restrictions">Catégories interdites</TabsTrigger>
        </TabsList>

        {/* ── Advertisers ── */}
        <TabsContent value="advertisers" className="space-y-3">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {MOCK_ADVERTISERS.map((advertiser) => {
              const active  = advertiser.campaigns.filter(c => c.status === 'active').length;
              const impressions = advertiser.campaigns.reduce((s, c) => s + c.impressions, 0);
              const cfg = STATUS_CFG[advertiser.status];
              return (
                <motion.div key={advertiser.id} variants={rowItem}
                  className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-sm hover:border-border/70 transition-colors cursor-pointer"
                  onClick={() => setSelected(advertiser)}
                >
                  {/* Icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Megaphone className="h-5 w-5" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{advertiser.name}</p>
                      <Badge className={cn('border-0 text-[10px]', cfg.color)}>{cfg.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{advertiser.contactEmail}</p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-8 shrink-0 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{advertiser.campaigns.length}</p>
                      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Campagnes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">{active}</p>
                      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Actives</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{impressions.toLocaleString('fr-FR')}</p>
                      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Impressions</p>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        {/* ── Campaigns ── */}
        <TabsContent value="campaigns">
          <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 bg-muted/30">
                  <TableHead>Campagne</TableHead>
                  <TableHead>Annonceur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ADVERTISERS.flatMap(a =>
                  a.campaigns.map(c => ({ ...c, advertiserName: a.name }))
                ).map((campaign) => {
                  const ctrVal = campaign.impressions > 0
                    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
                    : '0.00';
                  const ctrNum = parseFloat(ctrVal);
                  const cfg = STATUS_CFG[campaign.status];
                  const typeCfg = TYPE_CFG[campaign.type as keyof typeof TYPE_CFG] ?? { label: campaign.type, color: 'bg-muted text-muted-foreground' };
                  return (
                    <TableRow key={campaign.id} className="border-border/40 hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{campaign.targetUrl}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{campaign.advertiserName}</TableCell>
                      <TableCell>
                        <Badge className={cn('border-0 text-xs', typeCfg.color)}>{typeCfg.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{campaign.impressions.toLocaleString('fr-FR')}</p>
                          <p className="text-xs text-muted-foreground">{campaign.clicks.toLocaleString('fr-FR')} clics</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', ctrNum >= 3 ? 'bg-emerald-500' : ctrNum >= 2 ? 'bg-blue-500' : 'bg-muted-foreground/40')}
                              style={{ width: `${Math.min(ctrNum * 20, 100)}%` }}
                            />
                          </div>
                          <span className={cn('text-xs font-semibold tabular-nums', ctrNum >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
                            {ctrVal}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('border-0 text-xs', cfg.color)}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {campaign.status === 'active'
                            ? <Button variant="ghost" size="icon" className="h-7 w-7"><Pause className="h-3.5 w-3.5" /></Button>
                            : <Button variant="ghost" size="icon" className="h-7 w-7"><Play  className="h-3.5 w-3.5" /></Button>
                          }
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Edit  className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Restrictions ── */}
        <TabsContent value="restrictions" className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            <Ban className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Catégories toujours bloquées</p>
              <p className="mt-0.5 text-rose-700/80 dark:text-rose-400/80 text-xs">
                Ces catégories sont interdites sur toutes les surfaces PIQ Academy, quelle que soit la nature de l&apos;annonceur ou du contrat.
              </p>
            </div>
          </div>

          <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2">
            {FORBIDDEN.map((cat) => (
              <motion.div key={cat.id} variants={fadeUp}
                className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <Ban className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">{cat.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
                </div>
                <Switch disabled checked={true} />
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Advertiser detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>{selected?.contactEmail}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Campagnes', selected.campaigns.length],
                  ['Actives', selected.campaigns.filter(c => c.status === 'active').length],
                  ['Impressions', selected.campaigns.reduce((s, c) => s + c.impressions, 0).toLocaleString('fr-FR')],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-xl border border-border/40 bg-muted/30 p-3 text-center">
                    <p className="text-xl font-bold">{v}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{l}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {selected.campaigns.map(c => {
                  const cfg = STATUS_CFG[c.status];
                  return (
                    <div key={c.id} className="flex items-center justify-between rounded-xl border border-border/40 p-3">
                      <p className="text-sm font-medium truncate max-w-[200px]">{c.name}</p>
                      <Badge className={cn('border-0 text-xs shrink-0', cfg.color)}>{cfg.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Fermer</Button>
            <Button className="gap-2"><Edit className="h-4 w-4" />Modifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add advertiser dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel annonceur</DialogTitle>
            <DialogDescription>Ajoutez un partenaire publicitaire à la plateforme.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Nom de l&apos;annonceur</Label><Input placeholder="Ex : Cameroon Mobile Corp" /></div>
            <div className="space-y-1.5"><Label>Email de contact</Label><Input type="email" placeholder="contact@advertiser.cm" /></div>
            <div className="space-y-1.5"><Label>Secteur d&apos;activité</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="telecom">Télécommunications</SelectItem>
                  <SelectItem value="finance">Finance & banque</SelectItem>
                  <SelectItem value="education">Éducation</SelectItem>
                  <SelectItem value="retail">Commerce & distribution</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Notes internes</Label><Textarea rows={3} placeholder="Conditions particulières, contexte du partenariat…" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Annuler</Button>
            <Button onClick={() => setAddOpen(false)}>Créer l&apos;annonceur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
