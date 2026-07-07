'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Plus, Trophy, BookOpen, Clock, CheckCircle, ChevronRight, Home } from 'lucide-react';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } };
const rowItem: Variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

const TYPE_CFG: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  mock_exam: { label: 'Examen blanc', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" /> },
  olympiad:  { label: 'Olympiade',    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', icon: <Trophy className="h-5 w-5 text-violet-600 dark:text-violet-400" /> },
};
const STATUS_CFG: Record<string, { label: string; badge: string }> = {
  draft:              { label: 'Brouillon',            badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  registration_open:  { label: 'Inscriptions ouvertes', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  in_progress:        { label: 'En cours',              badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  grading:            { label: 'Correction',            badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  completed:          { label: 'Terminé',                badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

type Tab = 'all' | 'mock_exam' | 'olympiad';

export default function EventsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = tab === 'all' ? MOCK_EVENTS : MOCK_EVENTS.filter(e => e.type === tab);
  const stats = {
    active:   MOCK_EVENTS.filter(e => e.status === 'registration_open' || e.status === 'in_progress').length,
    grading:  MOCK_EVENTS.filter(e => e.status === 'grading').length,
    completed: MOCK_EVENTS.filter(e => e.status === 'completed').length,
  };

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3 pb-2">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground">
            <Home className="h-3 w-3" /><ChevronRight className="h-3 w-3 opacity-30" />
            <span>Engagement</span><ChevronRight className="h-3 w-3 opacity-30" />
            <span className="font-medium text-foreground/80">Événements</span>
          </nav>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Événements</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Examens blancs et olympiades</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />Nouvel événement</Button>
          </div>
          <div className="relative h-px w-full bg-border/40"><div className="absolute left-0 top-0 h-px w-16 brand-gradient-bg opacity-60" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Actifs',     value: stats.active,    icon: <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, color: 'bg-emerald-500/10' },
            { label: 'Correction', value: stats.grading,   icon: <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />, color: 'bg-amber-500/10' },
            { label: 'Terminés',   value: stats.completed, icon: <CheckCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />, color: 'bg-slate-500/10' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-sm">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', s.color)}>{s.icon}</div>
              <div><p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{s.label}</p><p className="text-xl font-bold tabular-nums">{s.value}</p></div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-2xl border border-border/40 bg-card p-1.5 shadow-sm w-fit">
          {(['all', 'mock_exam', 'olympiad'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn('rounded-full px-4 py-2 text-sm font-medium transition-all', tab === t ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {t === 'all' ? 'Tous' : t === 'mock_exam' ? 'Examens blancs' : 'Olympiades'}
            </button>
          ))}
        </div>
        <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="show">
          {filtered.map(e => {
            const tc = TYPE_CFG[e.type] ?? TYPE_CFG.mock_exam;
            const sc = STATUS_CFG[e.status] ?? STATUS_CFG.draft;
            return (
              <motion.div key={e.id} variants={rowItem} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all hover:border-border/70 hover:shadow-md">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8">{tc.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground leading-tight">{e.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', tc.badge)}>{tc.label}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', sc.badge)}>{sc.label}</span>
                    </div>
                  </div>
                </div>
                <dl className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between"><dt>Début</dt><dd className="font-medium text-foreground">{new Date(e.startDate).toLocaleDateString('fr-FR')}</dd></div>
                  <div className="flex justify-between"><dt>Fin</dt><dd className="font-medium text-foreground">{new Date(e.endDate).toLocaleDateString('fr-FR')}</dd></div>
                  <div className="flex justify-between"><dt>Clôture inscr.</dt><dd className="font-medium text-foreground">{new Date(e.registrationDeadline).toLocaleDateString('fr-FR')}</dd></div>
                  <div className="flex justify-between"><dt>Tarif</dt><dd className="font-medium text-foreground">{e.price.toLocaleString('fr-FR')} FCFA</dd></div>
                  <div className="flex justify-between"><dt>Classes</dt><dd className="font-medium text-foreground text-right">{e.classes.join(', ')}</dd></div>
                </dl>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground/50">
              <Calendar className="mb-3 h-10 w-10" />
              <p className="text-sm font-medium">Aucun événement dans cette catégorie</p>
            </div>
          )}
        </motion.div>
      </div>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Créer un événement</DialogTitle><DialogDescription>Configurez un nouvel événement (examen blanc ou olympiade).</DialogDescription></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label>
                <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent><SelectItem value="mock_exam">Examen blanc</SelectItem><SelectItem value="olympiad">Olympiade</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Pays</Label>
                <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent><SelectItem value="cm">Cameroun</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Nom de l&apos;événement</Label><Input className="mt-1" placeholder="Ex: Bac Blanc National 2025" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date de début</Label><Input className="mt-1" type="date" /></div>
              <div><Label>Date de fin</Label><Input className="mt-1" type="date" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Clôture des inscriptions</Label><Input className="mt-1" type="date" /></div>
              <div><Label>Tarif (FCFA)</Label><Input className="mt-1" type="number" placeholder="5000" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button><Button onClick={() => setShowCreate(false)}>Créer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
