'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { MessageCircle, Plus, Users, CircleCheck as CheckCircle, ChevronRight, Hop as Home, ExternalLink } from 'lucide-react';
import { MOCK_WHATSAPP_COMMUNITIES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } };
const rowItem: Variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

export default function WhatsAppCommunitiesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const total   = MOCK_WHATSAPP_COMMUNITIES.length;
  const members = MOCK_WHATSAPP_COMMUNITIES.reduce((acc, c) => acc + c.memberCount, 0);
  const active  = MOCK_WHATSAPP_COMMUNITIES.filter(c => c.active).length;

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3 pb-2">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground">
            <Home className="h-3 w-3" /><ChevronRight className="h-3 w-3 opacity-30" />
            <span>Engagement</span><ChevronRight className="h-3 w-3 opacity-30" />
            <span className="font-medium text-foreground/80">Communautés WhatsApp</span>
          </nav>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Communautés WhatsApp</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Gérez les liens des communautés WhatsApp par classe</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />Nouvelle communauté</Button>
          </div>
          <div className="relative h-px w-full bg-border/40"><div className="absolute left-0 top-0 h-px w-16 brand-gradient-bg opacity-60" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Communautés', value: total,   icon: <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, color: 'bg-emerald-500/10' },
            { label: 'Membres',     value: members, icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-500/10' },
            { label: 'Actives',     value: active,  icon: <CheckCircle className="h-5 w-5 text-primary/80" />, color: 'bg-primary/10' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-sm">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', s.color)}>{s.icon}</div>
              <div><p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{s.label}</p><p className="text-xl font-bold tabular-nums">{s.value.toLocaleString('fr-FR')}</p></div>
            </div>
          ))}
        </div>
        <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
          {MOCK_WHATSAPP_COMMUNITIES.map(c => (
            <motion.div key={c.id} variants={rowItem} className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all hover:border-border/70 hover:shadow-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{c.className}</p>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    c.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  )}>{c.active ? 'Active' : 'Désactivée'}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.memberCount.toLocaleString('fr-FR')} membres · créée le {c.createdAt}</p>
              </div>
              <a href={c.link} target="_blank" rel="noopener noreferrer"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Créer une communauté</DialogTitle><DialogDescription>Ajoutez un lien d&apos;invitation WhatsApp pour une classe.</DialogDescription></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Classe</Label><Input className="mt-1" placeholder="Ex : Terminale C" /></div>
            <div><Label>Lien d&apos;invitation WhatsApp</Label><Input className="mt-1" placeholder="https://chat.whatsapp.com/…" /></div>
            <div><Label>Nombre de membres (estimation)</Label><Input className="mt-1" type="number" placeholder="Ex : 50" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button><Button onClick={() => setShowCreate(false)}>Créer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
