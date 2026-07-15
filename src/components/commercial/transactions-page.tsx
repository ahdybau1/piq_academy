'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { DollarSign, Search, Download, Calendar, ChevronRight, CircleAlert as AlertCircle } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const STATUS_CFG = {
  completed: { label: 'Complète', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  pending: { label: 'En attente', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  failed: { label: 'Échouée', dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  refunded: { label: 'Remboursée', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
} as const;

const TYPE_BADGE: Record<string, string> = {
  subscription: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  purchase: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  donation: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

const STATUS_FILTER_ITEMS: Record<string, string> = {
  all: 'Tous',
  completed: 'Complètes',
  pending: 'En attente',
  failed: 'Échouées',
  refunded: 'Remboursées',
};
const TYPE_LABEL: Record<string, string> = { subscription: 'Abonnement', purchase: 'Achat', donation: 'Don' };

type Tx = typeof MOCK_TRANSACTIONS[number];

export default function TransactionsPage() {
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_TRANSACTIONS.filter((tx) => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (search && !tx.userName.toLowerCase().includes(search.toLowerCase()) && !tx.id.includes(search)) return false;
    return true;
  });

  const stats = {
    revenue: '42.1M FCFA',
    total: MOCK_TRANSACTIONS.length,
    pending: MOCK_TRANSACTIONS.filter((t) => t.status === 'pending').length,
    failed: MOCK_TRANSACTIONS.filter((t) => t.status === 'failed').length,
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Transactions"
          description="Historique de toutes les transactions financières"
          breadcrumbs={[{ label: 'Commercial' }, { label: 'Transactions' }]}
          actions={<Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />Exporter</Button>}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Revenus (mois)', value: stats.revenue, icon: <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, color: 'bg-emerald-500/10' },
            { label: 'Transactions', value: stats.total, icon: <DollarSign className="h-5 w-5 text-primary/80" />, color: 'bg-primary/10' },
            { label: 'En attente', value: stats.pending, icon: <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />, color: 'bg-amber-500/10' },
            { label: 'Échouées', value: stats.failed, icon: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />, color: 'bg-rose-500/10' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-sm">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', s.color)}>{s.icon}</div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{s.label}</p>
                <p className="text-xl font-bold tabular-nums">{typeof s.value === 'number' ? s.value.toLocaleString('fr-FR') : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input className="pl-9" placeholder="Utilisateur, ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select items={STATUS_FILTER_ITEMS} value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="completed">Complètes</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="failed">Échouées</SelectItem>
              <SelectItem value="refunded">Remboursées</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} résultat(s)</span>
        </div>

        <motion.div className="space-y-2" variants={stagger} initial="hidden" animate="show">
          {filtered.map((tx) => {
            const sc = STATUS_CFG[tx.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.completed;
            return (
              <motion.button
                key={tx.id}
                variants={rowItem}
                onClick={() => setSelectedTx(tx)}
                className="group w-full rounded-2xl border border-border/40 bg-card px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8">
                    <DollarSign className="h-5 w-5 text-primary/70" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground transition-colors group-hover:text-primary">{tx.userName}</p>
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', TYPE_BADGE[tx.type] ?? 'bg-muted text-muted-foreground')}>
                        {TYPE_LABEL[tx.type] ?? tx.type}
                      </span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', sc.badge)}>
                        {sc.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {tx.provider}
                      {tx.providerRef && (
                        <>
                          <span className="mx-1.5 opacity-30">·</span>
                          <span className="font-mono">{tx.providerRef}</span>
                        </>
                      )}
                      <span className="mx-1.5 opacity-30">·</span>
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold tabular-nums text-foreground">{tx.amount.toLocaleString('fr-FR')}</p>
                    <p className="text-xs text-muted-foreground">{tx.currency}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-primary/50" />
                </div>
              </motion.button>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
              <Search className="mb-3 h-10 w-10" />
              <p className="text-sm font-medium">Aucune transaction trouvée</p>
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détail de la transaction</DialogTitle>
            <DialogDescription>
              {selectedTx?.providerRef ? (
                <>Référence : <span className="font-mono">{selectedTx.providerRef}</span></>
              ) : (
                <>{selectedTx?.userName} · {selectedTx?.provider}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedTx && (() => {
            const sc = STATUS_CFG[selectedTx.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.completed;
            return (
              <dl className="space-y-3 text-sm">
                {[
                  { label: 'Utilisateur', value: selectedTx.userName },
                  { label: 'Type', value: TYPE_LABEL[selectedTx.type] ?? selectedTx.type },
                  { label: 'Montant', value: `${selectedTx.amount.toLocaleString('fr-FR')} ${selectedTx.currency}`, bold: true },
                  { label: 'Provider', value: selectedTx.provider },
                  ...(selectedTx.providerRef ? [{ label: 'Réf. provider', value: selectedTx.providerRef, mono: true }] : []),
                  { label: 'Date', value: new Date(selectedTx.createdAt).toLocaleString('fr-FR') },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 border-b border-border/20 pb-3 last:border-0 last:pb-0">
                    <dt className="text-muted-foreground">{item.label}</dt>
                    <dd className={cn('text-right', (item as { bold?: boolean }).bold && 'font-bold', (item as { mono?: boolean }).mono && 'font-mono text-xs')}>
                      {item.value}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Statut</dt>
                  <dd>
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', sc.badge)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', sc.dot)} />
                      {sc.label}
                    </span>
                  </dd>
                </div>
              </dl>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
