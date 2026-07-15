'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CircleAlert as AlertCircle, Clock, CircleCheck as CheckCircle, FileText, MessageSquare, ArrowLeft, ChevronRight, Hop as Home, Users, Timer } from 'lucide-react';
import { MOCK_CONTESTATIONS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

// ── Animation ─────────────────────────────────────────────────────────────────

type Dir = 'forward' | 'back';

function slide(dir: Dir): Variants {
  return {
    initial: { x: dir === 'forward' ? 64 : -64, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { x: dir === 'forward' ? -64 : 64, opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] } },
  };
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  open: { label: 'Ouverte', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  reviewing: { label: 'En révision', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  resolved: { label: 'Résolue', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
} as const;

type Contestation = typeof MOCK_CONTESTATIONS[number];

// ── KPI pill ──────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-sm">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>{icon}</div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{label}</p>
        <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function ContestationsPage() {
  const [selectedContestation, setSelectedContestation] = useState<Contestation | null>(null);
  const [dir, setDir] = useState<Dir>('forward');
  const [filter, setFilter] = useState<string>('all');
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [decision, setDecision] = useState<'maintained' | 'revised'>('maintained');
  const [newGrade, setNewGrade] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [now] = useState(() => Date.now());

  const stats = {
    open: MOCK_CONTESTATIONS.filter((c) => c.status === 'open').length,
    reviewing: MOCK_CONTESTATIONS.filter((c) => c.status === 'reviewing').length,
    resolved: MOCK_CONTESTATIONS.filter((c) => c.status === 'resolved').length,
  };

  const filteredContestations = filter === 'all'
    ? MOCK_CONTESTATIONS
    : MOCK_CONTESTATIONS.filter((c) => c.status === filter);

  const openContestation = (c: Contestation) => {
    setDir('forward');
    setSelectedContestation(c);
  };
  const closeContestation = () => {
    setDir('back');
    setSelectedContestation(null);
  };

  // ── LEVEL 0 — Liste ───────────────────────────────────────────────────────

  const ListLevel = (
    <div className="space-y-6">
      <div className="space-y-3 pb-2">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span>Validation</span>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80">Contestations de note</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight">Contestations de note</h1>
        <p className="text-sm text-muted-foreground">Gérez les contestations de notes soumises par les élèves</p>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
        <KpiCard
          icon={<AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          label="Ouvertes" value={stats.open} color="bg-amber-500/10"
        />
        <KpiCard
          icon={<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          label="En révision" value={stats.reviewing} color="bg-blue-500/10"
        />
        <KpiCard
          icon={<CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          label="Résolues" value={stats.resolved} color="bg-emerald-500/10"
        />
        <KpiCard
          icon={<Timer className="h-5 w-5 text-primary/80" />}
          label="Délai moyen" value="2.3j" color="bg-primary/10"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'open', 'reviewing', 'resolved'] as const).map((f) => {
          const cfg = f === 'all' ? null : STATUS_CONFIG[f];
          const count = f === 'all'
            ? MOCK_CONTESTATIONS.length
            : MOCK_CONTESTATIONS.filter((c) => c.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                filter === f
                  ? 'border-primary/40 bg-primary/8 text-primary'
                  : 'border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              {cfg && <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />}
              {f === 'all' ? 'Toutes' : cfg?.label ?? f}
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                filter === f ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {filteredContestations.map((contestation) => {
          const cfg = STATUS_CONFIG[contestation.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.open;
          const daysLeft = Math.ceil((new Date(contestation.deadline).getTime() - now) / 86400000);
          return (
            <motion.button
              key={contestation.id}
              variants={rowItem}
              onClick={() => openContestation(contestation)}
              className="group w-full rounded-2xl border border-border/40 bg-card p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-slate-700 text-xs font-bold text-white">
                    {initials(contestation.studentName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                      {contestation.studentName}
                    </p>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', cfg.badge)}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Note initiale : <strong className="text-foreground">{contestation.initialGrade}/20</strong></span>
                    <span className="opacity-40">·</span>
                    <span className={cn(daysLeft < 2 && contestation.status !== 'resolved' ? 'font-medium text-rose-600' : '')}>
                      Délai : {new Date(contestation.deadline).toLocaleDateString('fr-FR')}
                    </span>
                  </p>
                  <p className="mt-2 line-clamp-1 text-xs text-muted-foreground/80">{contestation.reason}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/50" />
              </div>
            </motion.button>
          );
        })}
        {filteredContestations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
            <FileText className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Aucune contestation dans cette catégorie</p>
          </div>
        )}
      </motion.div>
    </div>
  );

  // ── LEVEL 1 — Détail ──────────────────────────────────────────────────────

  const DetailLevel = selectedContestation && (() => {
    const cfg = STATUS_CONFIG[selectedContestation.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.open;
    const canDecide = selectedContestation.status === 'open' || selectedContestation.status === 'reviewing';
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground">
            <Home className="h-3 w-3" />
            <ChevronRight className="h-3 w-3 opacity-30" />
            <button className="transition-colors hover:text-foreground" onClick={closeContestation}>Contestations</button>
            <ChevronRight className="h-3 w-3 opacity-30" />
            <span className="font-medium text-foreground/80">{selectedContestation.studentName}</span>
          </nav>
          <div className="flex items-start gap-3">
            <button
              onClick={closeContestation}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold tracking-tight">Contestation de {selectedContestation.studentName}</h1>
            </div>
            <span className={cn('shrink-0 rounded-full px-3 py-1 text-xs font-semibold', cfg.badge)}>
              {cfg.label}
            </span>
          </div>
          <div className="relative h-px w-full bg-border/40">
            <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
          </div>
        </div>

        {/* Grade card */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl border border-border/40 bg-card py-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Note initiale</p>
            <p className="mt-2 text-4xl font-bold text-foreground">{selectedContestation.initialGrade}<span className="text-lg text-muted-foreground">/20</span></p>
          </div>
          {selectedContestation.contestedGrade && (
            <div className="flex flex-col items-center rounded-2xl border border-amber-200/60 bg-amber-50/50 py-6 shadow-sm dark:border-amber-900/30 dark:bg-amber-950/20">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">Note contestée</p>
              <p className="mt-2 text-4xl font-bold text-amber-700 dark:text-amber-300">{selectedContestation.contestedGrade}<span className="text-lg opacity-60">/20</span></p>
            </div>
          )}
          <div className="flex flex-col items-center rounded-2xl border border-border/40 bg-card py-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Délai</p>
            <p className="mt-2 text-base font-bold text-foreground">{new Date(selectedContestation.deadline).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessageSquare className="h-4 w-4 text-primary" />
            Motif de la contestation
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selectedContestation.reason}</p>
        </div>

        {selectedContestation.assignedTo && (
          <div className="rounded-2xl border border-border/40 bg-card px-6 py-4 text-sm shadow-sm">
            <span className="text-muted-foreground">Assigné à : </span>
            <span className="font-semibold">Second correcteur</span>
          </div>
        )}

        {/* Resolution (if resolved) */}
        {selectedContestation.resolution && (
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-6 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-950/20">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Résolution</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Décision</span>
                <span className={cn('font-semibold', selectedContestation.resolution.decision === 'revised' ? 'text-emerald-700' : 'text-amber-700')}>
                  {selectedContestation.resolution.decision === 'revised' ? 'Note révisée' : 'Note maintenue'}
                </span>
              </div>
              {selectedContestation.resolution.newGrade && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nouvelle note</span>
                  <span className="font-bold">{selectedContestation.resolution.newGrade}/20</span>
                </div>
              )}
              <p className="pt-1 text-muted-foreground">{selectedContestation.resolution.reason}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        {canDecide && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Actions</p>
            <Button className="w-full gap-2" onClick={() => setShowDecisionDialog(true)}>
              <CheckCircle className="h-4 w-4" />
              Prendre une décision
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <Users className="h-4 w-4" />
              Assigner à un second correcteur
            </Button>
          </div>
        )}
      </div>
    );
  })();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedContestation ? 'detail' : 'list'}
            variants={slide(dir)}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {selectedContestation ? DetailLevel : ListLevel}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Décision sur la contestation</DialogTitle>
            <DialogDescription>
              Prenez une décision concernant cette contestation de note
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Décision</Label>
              <Select
                items={{ maintained: 'Note maintenue', revised: 'Note révisée' }}
                value={decision}
                onValueChange={(v) => setDecision(v as 'maintained' | 'revised')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintained">Note maintenue</SelectItem>
                  <SelectItem value="revised">Note révisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {decision === 'revised' && (
              <div className="space-y-2">
                <Label htmlFor="new-grade">Nouvelle note</Label>
                <Input id="new-grade" type="number" min="0" max="20" placeholder="Ex: 15" value={newGrade} onChange={(e) => setNewGrade(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Motif de la décision</Label>
              <Textarea
                id="reason"
                placeholder="Expliquez la raison de votre décision..."
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDecisionDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowDecisionDialog(false)}>
              Confirmer la décision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
