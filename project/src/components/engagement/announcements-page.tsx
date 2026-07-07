'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Megaphone, Plus, Edit, Trash2, Bell, Calendar, AlertTriangle, Home, ChevronRight } from 'lucide-react';
import { MOCK_ANNOUNCEMENTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } };
const rowItem: Variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

const URGENCY_CFG = {
  low:      { label: 'Basse',    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: <Megaphone className="h-4 w-4 text-slate-500" /> },
  medium:   { label: 'Moyenne',  badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" /> },
  high:     { label: 'Haute',    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" /> },
  critical: { label: 'Critique', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', icon: <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" /> },
} as const;

export default function AnnouncementsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const stats = {
    active:   MOCK_ANNOUNCEMENTS.filter(a => a.active).length,
    total:    MOCK_ANNOUNCEMENTS.length,
    critical: MOCK_ANNOUNCEMENTS.filter(a => a.urgency === 'critical').length,
  };
  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3 pb-2">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground">
            <Home className="h-3 w-3" /><ChevronRight className="h-3 w-3 opacity-30" />
            <span>Engagement</span><ChevronRight className="h-3 w-3 opacity-30" />
            <span className="font-medium text-foreground/80">Annonces</span>
          </nav>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Annonces</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Bannières et messages diffusés aux utilisateurs de la plateforme</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />Nouvelle annonce</Button>
          </div>
          <div className="relative h-px w-full bg-border/40"><div className="absolute left-0 top-0 h-px w-16 brand-gradient-bg opacity-60" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Actives',   value: stats.active,   icon: <Megaphone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, color: 'bg-emerald-500/10' },
            { label: 'Total',     value: stats.total,    icon: <Calendar className="h-5 w-5 text-primary/80" />, color: 'bg-primary/10' },
            { label: 'Critiques', value: stats.critical, icon: <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />, color: 'bg-rose-500/10' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-sm">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', s.color)}>{s.icon}</div>
              <div><p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{s.label}</p><p className="text-xl font-bold tabular-nums">{s.value}</p></div>
            </div>
          ))}
        </div>
        <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
          {MOCK_ANNOUNCEMENTS.map(a => {
            const uc = URGENCY_CFG[a.urgency as keyof typeof URGENCY_CFG] ?? URGENCY_CFG.low;
            return (
              <motion.div key={a.id} variants={rowItem} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all hover:border-border/70 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/8">{uc.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{a.title}</p>
                      <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', uc.badge)}>{uc.label}</span>
                      {a.active && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Active</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground/60">
                      Du {a.startDate} au {a.endDate} · Ciblage : {a.targetCountries.join(', ') || 'Tous pays'}
                      {a.targetClasses.length > 0 && ` · Classes : ${a.targetClasses.join(', ')}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle annonce</DialogTitle><DialogDescription>Créez une bannière d&apos;annonce à diffuser sur la plateforme.</DialogDescription></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Titre</Label><Input className="mt-1" placeholder="Ex: Maintenance programmée" /></div>
            <div><Label>Contenu</Label><Textarea className="mt-1" placeholder="Message de l&apos;annonce…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Période d&apos;affichage</Label><Input className="mt-1" type="date" /></div>
              <div><Label>Niveau d&apos;urgence</Label>
                <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button><Button onClick={() => setShowCreate(false)}>Créer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
