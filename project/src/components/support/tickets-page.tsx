'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Headphones, Clock, CheckCircle, AlertCircle, Send,
  ArrowLeft, ChevronRight, Home, MessageSquare, User,
} from 'lucide-react';
import { MOCK_TICKETS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

// ── Animation ─────────────────────────────────────────────────────────────────

type Dir = 'forward' | 'back';

function slide(dir: Dir): Variants {
  return {
    initial: { x: dir === 'forward' ? 64 : -64, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.36, ease: [0.22,1,0.36,1] as [number,number,number,number] } },
    exit:    { x: dir === 'forward' ? -64 : 64, opacity: 0, transition: { duration: 0.22, ease: [0.4,0,0.6,1] as [number,number,number,number] } },
  };
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22,1,0.36,1] as [number,number,number,number] } },
};

// ── Configs ───────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  open:        { label: 'Ouvert',     dot: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  in_progress: { label: 'En cours',   dot: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  waiting:     { label: 'En attente', dot: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  resolved:    { label: 'Résolu',     dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  closed:      { label: 'Fermé',      dot: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
} as const;

const PRIORITY_CFG = {
  low:    { label: 'Basse',   color: 'text-slate-500'   },
  medium: { label: 'Moyenne', color: 'text-amber-600'   },
  high:   { label: 'Haute',   color: 'text-rose-600'    },
} as const;

type Ticket = typeof MOCK_TICKETS[number];

// ── KPI pill ──────────────────────────────────────────────────────────────────

function KpiPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-sm">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{label}</p>
        <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SupportTicketsPage() {
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [dir, setDir] = useState<Dir>('forward');
  const [filter, setFilter] = useState<string>('all');
  const [message, setMessage] = useState('');

  const stats = {
    open:    MOCK_TICKETS.filter((t) => t.status === 'open').length,
    active:  MOCK_TICKETS.filter((t) => t.status === 'in_progress' || t.status === 'waiting').length,
    resolved: 128,
  };

  const filtered = filter === 'all'
    ? MOCK_TICKETS
    : MOCK_TICKETS.filter((t) => t.status === filter);

  const open = (t: Ticket) => { setDir('forward'); setSelected(t); };
  const close = () => { setDir('back'); setSelected(null); };

  // ── LEVEL 0 — Liste ───────────────────────────────────────────────────────

  const ListLevel = (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3 pb-2">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span>Support</span>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80">Tickets</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight">Tickets de support</h1>
        <p className="text-sm text-muted-foreground">Gérez les demandes d&apos;assistance des utilisateurs</p>
        <div className="relative h-px w-full bg-border/40">
          <div className="absolute left-0 top-0 h-px w-16 brand-gradient-bg opacity-60" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiPill
          icon={<AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          label="Ouverts"
          value={stats.open}
          color="bg-amber-500/10"
        />
        <KpiPill
          icon={<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          label="En traitement"
          value={stats.active}
          color="bg-blue-500/10"
        />
        <KpiPill
          icon={<CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          label="Résolus ce mois"
          value={stats.resolved}
          color="bg-emerald-500/10"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'open', 'in_progress', 'waiting', 'resolved'] as const).map((f) => {
          const cfg = f === 'all' ? null : STATUS_CFG[f as keyof typeof STATUS_CFG];
          const count = f === 'all' ? MOCK_TICKETS.length : MOCK_TICKETS.filter((t) => t.status === f).length;
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
              {f === 'all' ? 'Tous' : (STATUS_CFG[f as keyof typeof STATUS_CFG]?.label ?? f)}
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums', filter === f ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Ticket list */}
      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {filtered.map((ticket) => {
          const sc = STATUS_CFG[ticket.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.closed;
          const pc = PRIORITY_CFG[ticket.priority as keyof typeof PRIORITY_CFG] ?? PRIORITY_CFG.low;
          const lastMsg = ticket.messages[ticket.messages.length - 1];
          return (
            <motion.button
              key={ticket.id}
              variants={item}
              onClick={() => open(ticket)}
              className="group w-full rounded-2xl border border-border/40 bg-card p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                  <Headphones className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground transition-colors group-hover:text-primary">{ticket.title}</p>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', sc.badge)}>
                      {sc.label}
                    </span>
                    <span className={cn('text-xs font-medium', pc.color)}>{pc.label} priorité</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{ticket.userName}</span>
                    <span className="opacity-40">·</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                    {lastMsg && (
                      <>
                        <span className="opacity-40">·</span>
                        <MessageSquare className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">{lastMsg.content}</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/50" />
              </div>
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
            <CheckCircle className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Aucun ticket dans cette catégorie</p>
          </div>
        )}
      </motion.div>
    </div>
  );

  // ── LEVEL 1 — Conversation ────────────────────────────────────────────────

  const ConvLevel = selected && (
    <div className="flex h-full flex-col space-y-5">
      {/* Header */}
      <div className="space-y-3">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <button className="hover:text-foreground transition-colors" onClick={close}>Tickets</button>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="max-w-[200px] truncate font-medium text-foreground/80">{selected.title}</span>
        </nav>
        <div className="flex items-start gap-3">
          <button
            onClick={close}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight">{selected.title}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {selected.userName} · {selected.userType === 'eleve' ? 'Élève' : 'Parent'}
            </p>
          </div>
          {(() => {
            const sc = STATUS_CFG[selected.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.closed;
            return (
              <span className={cn('shrink-0 rounded-full px-3 py-1 text-xs font-semibold', sc.badge)}>{sc.label}</span>
            );
          })()}
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="absolute left-0 top-0 h-px w-16 brand-gradient-bg opacity-60" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border/40 bg-muted/20 p-5">
        <div className="space-y-5">
          {selected.messages.map((msg, i) => {
            const isSupport = msg.sender === 'support';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className={cn('flex items-end gap-3', isSupport && 'flex-row-reverse')}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={isSupport ? 'bg-primary text-primary-foreground text-xs font-bold' : 'bg-slate-600 text-white text-xs font-bold'}>
                    {isSupport ? 'S' : selected.userName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  'max-w-[72%] rounded-2xl px-4 py-3',
                  isSupport
                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                    : 'rounded-bl-sm border border-border/40 bg-card'
                )}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={cn('mt-1.5 text-[10px]', isSupport ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                    {new Date(msg.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Reply box */}
      <div className="flex gap-3">
        <Textarea
          placeholder="Votre réponse…"
          className="min-h-[56px] flex-1 resize-none rounded-2xl border-border/50 bg-card"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) setMessage(''); }}
        />
        <Button
          disabled={!message.trim()}
          className="h-auto self-end rounded-2xl px-5 py-3 shadow-sm"
          onClick={() => setMessage('')}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={selected ? 'conv' : 'list'}
          variants={slide(dir)}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {selected ? ConvLevel : ListLevel}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
