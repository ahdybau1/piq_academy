'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, CheckCircle, Clock, Flag,
  ArrowLeft, ChevronRight, Home, UserX, Trash2, Bell,
} from 'lucide-react';
import { MOCK_FORUM_REPORTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type Dir = 'forward' | 'back';
function slide(dir: Dir): Variants {
  return {
    initial: { x: dir === 'forward' ? 64 : -64, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit:    { x: dir === 'forward' ? -64 : 64, opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] } },
  };
}
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } } };
const rowItem: Variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

const STATUS_CFG: Record<string, { label: string; badge: string }> = {
  pending:   { label: 'En attente', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  resolved:  { label: 'Résolu',     badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  dismissed: { label: 'Ignoré',     badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

type Report = typeof MOCK_FORUM_REPORTS[number];

export default function ForumModerationPage() {
  const [selected, setSelected] = useState<Report | null>(null);
  const [dir, setDir] = useState<Dir>('forward');

  const open  = (r: Report) => { setDir('forward'); setSelected(r); };
  const close = () => { setDir('back'); setSelected(null); };

  const stats = {
    pending:  MOCK_FORUM_REPORTS.filter(r => r.status === 'pending').length,
    resolved: MOCK_FORUM_REPORTS.filter(r => r.status === 'resolved').length,
    total:    MOCK_FORUM_REPORTS.length,
  };

  const ListLevel = (
    <div className="space-y-6">
      <div className="space-y-3 pb-2">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" /><ChevronRight className="h-3 w-3 opacity-30" />
          <span>Engagement</span><ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80">Forum</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight">Modération du forum</h1>
        <p className="text-sm text-muted-foreground">Gérez les signalements et modérez le contenu du forum</p>
        <div className="relative h-px w-full bg-border/40"><div className="absolute left-0 top-0 h-px w-16 brand-gradient-bg opacity-60" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'En attente', value: stats.pending,  icon: <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />, color: 'bg-amber-500/10' },
          { label: 'Résolus',    value: stats.resolved, icon: <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, color: 'bg-emerald-500/10' },
          { label: 'Total',      value: stats.total,    icon: <Flag className="h-5 w-5 text-primary/80" />, color: 'bg-primary/10' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-sm">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', s.color)}>{s.icon}</div>
            <div><p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{s.label}</p><p className="text-xl font-bold tabular-nums">{s.value}</p></div>
          </div>
        ))}
      </div>
      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {MOCK_FORUM_REPORTS.map(r => {
          const sc = STATUS_CFG[r.status] ?? STATUS_CFG.pending;
          return (
            <motion.button key={r.id} variants={rowItem} onClick={() => open(r)}
              className="group w-full rounded-2xl border border-border/40 bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                  <Flag className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Signalé par {r.reportedBy}</p>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', sc.badge)}>{sc.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.reason}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/60">{new Date(r.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-primary/50 transition-transform group-hover:translate-x-0.5" />
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );

  const DetailLevel = selected && (
    <div className="space-y-6">
      <div className="space-y-3">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" /><ChevronRight className="h-3 w-3 opacity-30" />
          <button className="hover:text-foreground transition-colors" onClick={close}>Forum</button>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80 truncate max-w-[200px]">{selected.reportedBy}</span>
        </nav>
        <div className="flex items-start gap-3">
          <button onClick={close} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm hover:border-primary/30 hover:bg-primary/5 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Signalement : {selected.reportedBy}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">ID message : {selected.messageId} · {new Date(selected.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="relative h-px w-full bg-border/40"><div className="absolute left-0 top-0 h-px w-16 brand-gradient-bg opacity-60" /></div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Raison du signalement</p>
        <p className="text-sm leading-relaxed text-foreground">{selected.reason}</p>
      </div>

      <div className="rounded-2xl border border-border/40 bg-muted/20 p-6 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Contexte de la conversation</p>
        <div className="space-y-2">
          {selected.context.beforeMessages.map((msg, idx) => (
            <div key={idx} className="rounded-lg bg-card p-3 text-sm text-muted-foreground border border-border/30">{msg}</div>
          ))}
          <div className="rounded-lg border-2 border-rose-300 bg-rose-50 p-3 text-sm dark:border-rose-900/50 dark:bg-rose-950/20">
            <div className="mb-1 flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-rose-500" />
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Message signalé</span>
            </div>
            {selected.context.reportedMessage}
          </div>
          {selected.context.afterMessages.map((msg, idx) => (
            <div key={idx} className="rounded-lg bg-card p-3 text-sm text-muted-foreground border border-border/30">{msg}</div>
          ))}
        </div>
      </div>

      {selected.status === 'pending' && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Actions</p>
          <div className="grid grid-cols-2 gap-3">
            <Button className="h-10 gap-2 rounded-xl text-xs" variant="destructive"><Trash2 className="h-4 w-4" />Supprimer le message</Button>
            <Button className="h-10 gap-2 rounded-xl text-xs" variant="outline"><Bell className="h-4 w-4" />Avertir l&apos;utilisateur</Button>
            <Button className="h-10 gap-2 rounded-xl text-xs" variant="outline"><UserX className="h-4 w-4" />Suspendre l&apos;utilisateur</Button>
            <Button className="h-10 gap-2 rounded-xl text-xs" variant="ghost"><CheckCircle className="h-4 w-4" />Ignorer le signalement</Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={selected ? 'detail' : 'list'} variants={slide(dir)} initial="initial" animate="animate" exit="exit">
          {selected ? DetailLevel : ListLevel}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
