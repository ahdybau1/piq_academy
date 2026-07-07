'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gift, Users, TrendingUp, Search, CheckCircle, Clock } from 'lucide-react';
import { MOCK_REFERRALS } from '@/lib/mock-data';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const STATUS_CFG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  completed: { label: 'Complété', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle className="h-3 w-3" /> },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
};

export default function ReferralsPage() {
  const [search, setSearch] = useState('');

  const completedCount = MOCK_REFERRALS.filter((r) => r.status === 'completed').length;
  const conversionRate = MOCK_REFERRALS.length > 0 ? Math.round((completedCount / MOCK_REFERRALS.length) * 100) : 0;

  const filtered = MOCK_REFERRALS.filter((r) =>
    r.referrerName.toLowerCase().includes(search.toLowerCase()) || r.referredName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader
        title="Parrainage"
        description="Configuration des récompenses et suivi des parrainages"
        breadcrumbs={[{ label: 'Commercial' }, { label: 'Parrainage' }]}
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Parrainages actifs', value: MOCK_REFERRALS.length.toString(), icon: <Users className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-500/10' },
          { label: 'Taux de conversion', value: `${conversionRate}%`, icon: <TrendingUp className="h-5 w-5 text-emerald-500" />, bg: 'bg-emerald-500/10' },
          { label: 'Récompenses versées', value: '125K FCFA', icon: <Gift className="h-5 w-5 text-violet-500" />, bg: 'bg-violet-500/10' },
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

      <Card className="border-border/40">
        <CardHeader><CardTitle>Configuration des récompenses</CardTitle><CardDescription>Récompense accordée au parrain lorsque le filleul s&apos;abonne</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type de récompense</Label>
              <Select items={{ discount: 'Réduction abonnement', credit: 'Crédit boutique' }} defaultValue="discount">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Réduction abonnement</SelectItem>
                  <SelectItem value="credit">Crédit boutique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Valeur</Label><Input defaultValue="500 FCFA" /></div>
          </div>
          <Button>Enregistrer</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher parrain, filleul…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Card className="border-border/40">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead>Parrain</TableHead>
                  <TableHead>Filleul</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Récompense</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ref) => {
                  const s = STATUS_CFG[ref.status];
                  return (
                    <TableRow key={ref.id} className="border-border/40 hover:bg-muted/30">
                      <TableCell className="font-medium">{ref.referrerName}</TableCell>
                      <TableCell>{ref.referredName}</TableCell>
                      <TableCell><Badge variant="outline" className={`gap-1 text-xs ${s.color}`}>{s.icon}{s.label}</Badge></TableCell>
                      <TableCell className="font-semibold text-sm">{ref.reward}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(ref.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Users className="h-10 w-10 mb-3 opacity-20" />
                <p className="font-medium">Aucun parrainage trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
