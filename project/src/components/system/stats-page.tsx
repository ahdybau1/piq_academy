'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users, BookOpen, FileText, TrendingUp, DollarSign,
  RefreshCw,
} from 'lucide-react';
import { MOCK_STATS } from '@/lib/mock-data';
import { useApp } from '@/lib/app-context';
import { ROLE_CONFIGS } from '@/lib/roles-config';
import { cn } from '@/lib/utils';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } };
const rowItem: Variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

// Metrics not yet tracked in MOCK_STATS — kept local to avoid touching the shared mock-data file.
const EXTRA_STATS = {
  sessionsToday: 3420,
  lessonsCompleted: 18650,
  newRegistrations: 412,
  monthlyRevenue: 42100000,
  activeSubscribers: 8412,
  arpu: 5005,
};

const CONTENT_PROGRESS = [
  { label: 'Cours', value: MOCK_STATS.contentStats.lessons, total: 3500 },
  { label: 'Exercices', value: MOCK_STATS.contentStats.exercises, total: 9889 },
  { label: 'Examens officiels', value: MOCK_STATS.contentStats.exams, total: 1600 },
];

const TOP_CONTENT = MOCK_STATS.topContent.map((c, i) => ({ ...c, type: i % 2 === 0 ? 'cours' : 'exercice' }));

const PERIOD_ITEMS: Record<string, string> = {
  week: 'Cette semaine',
  month: 'Ce mois',
  quarter: 'Ce trimestre',
  year: 'Cette année',
};

function KpiCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-sm">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>{icon}</div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{label}</p>
        <p className="text-xl font-bold tabular-nums">{typeof value === 'number' ? value.toLocaleString('fr-FR') : value}</p>
        {sub && <p className="text-[11px] text-muted-foreground/60">{sub}</p>}
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const { currentUser } = useApp();
  const roleConfig = ROLE_CONFIGS[currentUser.role];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Statistiques"
        description="Tableaux de bord et métriques de la plateforme"
        breadcrumbs={[{ label: 'Système' }, { label: 'Statistiques' }]}
        actions={
          <Select items={PERIOD_ITEMS} defaultValue="month">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Usage KPIs */}
      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Utilisation</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />} label="Utilisateurs actifs" value={MOCK_STATS.activeUsers} sub="+12.5% ce mois" color="bg-blue-500/10" />
          <KpiCard icon={<BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />} label="Sessions aujourd'hui" value={EXTRA_STATS.sessionsToday} color="bg-emerald-500/10" />
          <KpiCard icon={<FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />} label="Cours complétés" value={EXTRA_STATS.lessonsCompleted} color="bg-violet-500/10" />
          <KpiCard icon={<TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />} label="Nouveaux inscrits" value={EXTRA_STATS.newRegistrations} color="bg-amber-500/10" />
        </div>
      </div>

      {/* Financial KPIs — super_admin only */}
      {roleConfig.canViewFinancials && (
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Finances</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={<DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />} label="Revenus (mois)" value={`${(EXTRA_STATS.monthlyRevenue / 1e6).toFixed(1)}M FCFA`} sub="+8.3%" color="bg-emerald-500/10" />
            <KpiCard icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />} label="Abonnés actifs" value={EXTRA_STATS.activeSubscribers} color="bg-blue-500/10" />
            <KpiCard icon={<RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-400" />} label="Taux de renouvellement" value={`${MOCK_STATS.renewalRate}%`} sub="+2.3%" color="bg-amber-500/10" />
            <KpiCard icon={<TrendingUp className="h-5 w-5 text-primary/80" />} label="ARPU" value={`${EXTRA_STATS.arpu.toLocaleString('fr-FR')} FCFA`} color="bg-primary/10" />
          </div>
        </div>
      )}

      {/* Content progress + top content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Progression du contenu</h2>
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm space-y-4">
            {CONTENT_PROGRESS.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-foreground font-medium">{item.label}</span>
                  <span className="text-muted-foreground tabular-nums">{item.value.toLocaleString('fr-FR')} / {item.total.toLocaleString('fr-FR')}</span>
                </div>
                <div className="h-2 rounded-full bg-muted/50">
                  <div className="h-full rounded-full brand-gradient-bg opacity-80" style={{ width: `${Math.round((item.value / item.total) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Top contenus</h2>
          <motion.div className="rounded-2xl border border-border/40 bg-card shadow-sm divide-y divide-border/30" variants={stagger} initial="hidden" animate="show">
            {TOP_CONTENT.map((item, i) => (
              <motion.div key={item.id} variants={rowItem} className="flex items-center gap-4 px-6 py-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-xs font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                  {item.views.toLocaleString('fr-FR')} vues
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Daily active users */}
      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Utilisateurs actifs / jour</h2>
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
          <div className="flex items-end gap-2 h-[150px]">
            {MOCK_STATS.dailyActiveUsers.map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full brand-gradient-bg rounded-t opacity-70 transition-opacity hover:opacity-100"
                  style={{ height: `${(count / 12000) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">J{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
