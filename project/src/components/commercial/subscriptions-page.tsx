'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, X, Edit, Trash2, EyeOff, Eye, TrendingUp, TrendingDown, Users, RefreshCw } from 'lucide-react';
import { MOCK_SUBSCRIPTION_TIERS } from '@/lib/mock-data';
import { fetchSubscriptionTiers, deleteSubscriptionTier, setSubscriptionTierActive } from '@/lib/subscriptions/api-client';
import type { SubscriptionTierRow } from '@/lib/subscriptions/types';
import { cn } from '@/lib/utils';

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const TIER_ACCENTS = [
  { badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
];

const FEATURES = [
  { name: 'Accès aux cours', key: 'lessons' },
  { name: 'Exercices', key: 'exercises' },
  { name: 'Examens officiels', key: 'exams' },
  { name: 'Forum', key: 'forum' },
  { name: 'Communautés WhatsApp', key: 'whatsapp' },
  { name: 'Examens blancs', key: 'mock_exams' },
];

export function SubscriptionsPageView({
  initialTiers,
  countryId,
}: {
  initialTiers: SubscriptionTierRow[];
  countryId: string | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tiers, setTiers] = useState(initialTiers);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SubscriptionTierRow | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  // `initialTiers` vient du Server Component et reflète déjà le pays sélectionné ;
  // un changement de pays (switchCountry -> router.refresh()) ne remonte pas ce
  // composant, donc on resynchronise l'état local pendant le rendu (pattern React
  // officiel pour réinitialiser un state dérivé d'une prop, plutôt qu'un effet).
  const [prevInitialTiers, setPrevInitialTiers] = useState(initialTiers);
  if (initialTiers !== prevInitialTiers) {
    setPrevInitialTiers(initialTiers);
    setTiers(initialTiers);
  }

  const refresh = () => fetchSubscriptionTiers(countryId ?? undefined).then(setTiers).catch((e) => setError(e.message));

  const runAction = (fn: () => Promise<{ error?: string }>, onSuccess?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      router.refresh();
      refresh();
    });
  };

  const openDelete = (tier: SubscriptionTierRow) => {
    setDeleteTarget(tier);
    setConfirmChecked(false);
    setError(null);
  };

  return (
    <>
      <div className="space-y-8">
        <PageHeader
          title="Abonnements & Tarifs"
          description="Configurez les paliers d'abonnement et la grille tarifaire"
          breadcrumbs={[
            { label: 'Commercial' },
            { label: 'Abonnements & Tarifs' },
          ]}
          actions={
            <Button size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Modifier les tarifs
            </Button>
          }
        />

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Abonnés actifs', value: '8 420', sub: '42.1M FCFA/mois', icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-500/10', trend: null },
            { label: 'Nouveaux ce mois', value: '+1 247', sub: 'nouveaux abonnés', icon: <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, color: 'bg-emerald-500/10', trend: { label: '+12.5%', up: true } },
            { label: 'Renouvellement', value: '78.5%', sub: 'des abonnés renouvellent', icon: <RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-400" />, color: 'bg-amber-500/10', trend: { label: '-2.1%', up: false } },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums">{kpi.value}</p>
                  {kpi.trend && (
                    <div className="mt-1 flex items-center gap-1">
                      {kpi.trend.up ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-rose-500" />}
                      <span className={cn('text-xs font-medium', kpi.trend.up ? 'text-emerald-600' : 'text-rose-600')}>{kpi.trend.label}</span>
                    </div>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">{kpi.sub}</p>
                </div>
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', kpi.color)}>{kpi.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Paliers */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Paliers d&apos;abonnement</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Suppression bloquée si le palier a déjà été vendu (historique de facturation) — désactivez-le à la place.
          </p>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
            {tiers.map((tier, i) => {
              const accent = TIER_ACCENTS[i % TIER_ACCENTS.length];
              return (
                <motion.div
                  key={tier.id}
                  variants={rowItem}
                  className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
                >
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold', accent.icon)}>
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold capitalize text-foreground">{tier.name}</p>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                          tier.is_active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', tier.is_active ? 'bg-emerald-500' : 'bg-slate-400')} />
                        {tier.is_active ? 'Actif' : 'Désactivé'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
                      {(tier.price ?? 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-xl text-xs"
                      onClick={() =>
                        runAction(() => setSubscriptionTierActive({ id: tier.id, isActive: !tier.is_active }))
                      }
                    >
                      {tier.is_active ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          Réactiver
                        </>
                      )}
                    </Button>
                    <button
                      onClick={() => openDelete(tier)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
            {tiers.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground/50">Aucun palier configuré.</div>
            )}
          </motion.div>
        </div>

        {/* Feature matrix */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Matrice de droits par palier</h2>
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/30">
                    <th className="w-[200px] px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Fonctionnalité
                    </th>
                    {MOCK_SUBSCRIPTION_TIERS.map((tier, i) => {
                      const accent = TIER_ACCENTS[i % TIER_ACCENTS.length];
                      return (
                        <th key={tier.id} className="px-4 py-3.5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold capitalize text-foreground">{tier.name}</span>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', accent.badge)}>
                              {tier.price.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((feature, fi) => (
                    <tr key={feature.key} className={cn('border-b border-border/30 transition-colors hover:bg-muted/20', fi % 2 === 0 && 'bg-muted/5')}>
                      <td className="px-6 py-3.5 font-medium text-foreground">{feature.name}</td>
                      {MOCK_SUBSCRIPTION_TIERS.map((tier) => (
                        <td key={tier.id} className="px-4 py-3.5 text-center">
                          {tier.features[feature.key as keyof typeof tier.features] ? (
                            <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          ) : (
                            <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Classes par palier */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Classes par palier</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {MOCK_SUBSCRIPTION_TIERS.map((tier, i) => {
              const accent = TIER_ACCENTS[i % TIER_ACCENTS.length];
              const classMap: Record<string, string> = { c6e: '6ème', c5e: '5ème', c4e: '4ème', c3e: '3ème', c2nde: '2nde', c1ere: '1ère', cterm: 'Terminale' };
              return (
                <div key={tier.id} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold capitalize text-foreground">{tier.name}</h4>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold', accent.badge)}>
                      {tier.price.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tier.classIds.map((classId) => (
                      <span key={classId} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                        {classMap[classId] ?? classId}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historique des prix */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Historique des prix</h2>
          <div className="divide-y divide-border/30 rounded-2xl border border-border/40 bg-card shadow-sm">
            {[
              { date: '01/09/2024', tier: 'Premium', old: '7 500', new_: '8 000', by: 'Marie Nguema' },
              { date: '15/06/2024', tier: 'Standard', old: '4 500', new_: '5 000', by: 'Marie Nguema' },
            ].map((row) => (
              <div key={row.date + row.tier} className="flex items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{row.tier}</p>
                  <p className="text-xs text-muted-foreground">{row.date} · par {row.by}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="tabular-nums text-muted-foreground">{row.old} FCFA</span>
                  <span className="text-muted-foreground/40">→</span>
                  <span className="tabular-nums font-semibold text-emerald-600">{row.new_} FCFA</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supprimer un palier */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le palier « {deleteTarget?.name} »</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Si ce palier a déjà été vendu (au moins un abonnement lié), la
              suppression sera refusée — désactivez-le à la place pour le retirer sans casser l&apos;historique
              de facturation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-3">
            <Checkbox
              id="confirm-delete-tier"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked === true)}
            />
            <label htmlFor="confirm-delete-tier" className="cursor-pointer text-sm">
              Je confirme vouloir supprimer définitivement ce palier.
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={!confirmChecked}
              onClick={() =>
                runAction(() => deleteSubscriptionTier({ id: deleteTarget!.id }), () => setDeleteTarget(null))
              }
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
