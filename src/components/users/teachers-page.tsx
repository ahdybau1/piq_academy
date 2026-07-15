'use client';

import React, { useState } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Search, Building2, Clock, CircleCheck as CheckCircle, Circle as XCircle, UserPlus, BookOpen, Mail, GraduationCap, MoveHorizontal as MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MOCK_TEACHERS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

// ── Animations ─────────────────────────────────────────────────────────────
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };
const rowItem: Variants = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } } };

// ── Mock data ───────────────────────────────────────────────────────────────
const MOCK_PENDING = [
  { id: 'pr1', name: 'Marie-Claire Atangana', school: 'Lycée Général de Douala', subject: 'Physique-Chimie', classes: ['Terminale D'], date: '2024-12-09', email: 'mc.atangana@lycee-douala.cm' },
  { id: 'pr2', name: 'Joseph Nkongo', school: 'Collège Libermann', subject: 'Anglais', classes: ['2nde', '1ère'], date: '2024-12-08', email: 'j.nkongo@libermann.cm' },
];

// Subject accent colors (cycling)
const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
];

export default function TeachersPage() {
  const [search, setSearch] = useState('');
  const [rejectTarget, setRejectTarget] = useState<(typeof MOCK_PENDING)[0] | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approved, setApproved] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);

  const teachers = MOCK_TEACHERS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.schools.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    t.subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const pendingQueue = MOCK_PENDING.filter(p => !approved.includes(p.id) && !rejected.includes(p.id));

  function confirmReject() {
    if (!rejectTarget) return;
    setRejected(prev => [...prev, rejectTarget.id]);
    setRejectTarget(null);
    setRejectReason('');
  }

  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader
        title="Enseignants"
        description="Gestion des enseignants partenaires et demandes de rattachement en attente."
        breadcrumbs={[{ label: 'Utilisateurs' }, { label: 'Enseignants' }]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />Inviter par e-mail
            </Button>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />Ajouter un enseignant
            </Button>
          </div>
        }
      />

      {/* KPI Strip */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Enseignants actifs', value: MOCK_TEACHERS.filter(t => !t.pendingRequest).length.toString(),
            sub: `${MOCK_TEACHERS.length} au total`,
            icon: <Users className="h-5 w-5" />, bg: 'bg-primary/10', color: 'text-primary',
          },
          {
            label: 'Établissements partenaires', value: '127',
            sub: '12 pays couverts',
            icon: <Building2 className="h-5 w-5" />, bg: 'bg-blue-500/10', color: 'text-blue-500',
          },
          {
            label: 'Demandes en attente', value: pendingQueue.length.toString(),
            sub: pendingQueue.length > 0 ? 'Action requise' : 'Tout traité ✓',
            icon: <Clock className="h-5 w-5" />, bg: 'bg-amber-500/10', color: 'text-amber-500',
            alert: pendingQueue.length > 0,
          },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}
            className={cn(
              'rounded-2xl border border-border/40 bg-card p-5 shadow-sm',
              kpi.alert && 'border-l-4 border-l-amber-500',
            )}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{kpi.sub}</p>
              </div>
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ml-3', kpi.bg, kpi.color)}>
                {kpi.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="list" className="gap-2">
            <GraduationCap className="h-4 w-4" />Enseignants
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <Clock className="h-4 w-4" />Demandes
            {pendingQueue.length > 0 && (
              <Badge className="ml-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px] h-4 min-w-4 px-1">
                {pendingQueue.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Teacher list ── */}
        <TabsContent value="list" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nom, établissement, matière…"
              className="pl-9 bg-muted/30 border-border/50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            <AnimatePresence>
              {teachers.map((teacher) => (
                <motion.div
                  key={teacher.id}
                  variants={rowItem}
                  layout
                  className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm hover:border-border/70 transition-colors"
                >
                  {/* Avatar */}
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {teacher.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{teacher.name}</p>
                      {teacher.pendingRequest
                        ? <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px]">Demande en attente</Badge>
                        : <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px]">Actif</Badge>
                      }
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{teacher.email}</p>

                    {/* Subjects + Classes */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {teacher.subjects.map((subject: string, si: number) => (
                        <Badge key={si} className={cn('border-0 text-[10px]', SUBJECT_COLORS[si % SUBJECT_COLORS.length])}>
                          {subject}
                        </Badge>
                      ))}
                      <span className="text-[10px] text-muted-foreground/60 flex items-center px-1">·</span>
                      <span className="text-[11px] text-muted-foreground">{teacher.classes.join(', ')}</span>
                    </div>

                    {/* Schools */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {teacher.schools.map((school: string, si: number) => (
                        <span key={si} className="flex items-center gap-1 text-[10px] text-muted-foreground border border-border/50 rounded-full px-2 py-0.5">
                          <Building2 className="h-2.5 w-2.5" />{school}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2"><Eye className="h-4 w-4" />Voir le profil</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2"><BookOpen className="h-4 w-4" />Contenu soumis</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive"><Trash2 className="h-4 w-4" />Révoquer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {teachers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border/40">
                <Users className="h-10 w-10 mb-3 opacity-20" />
                <p className="font-medium text-sm">Aucun enseignant correspondant</p>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* ── Pending requests ── */}
        <TabsContent value="requests" className="space-y-4">
          {pendingQueue.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-muted-foreground rounded-2xl border border-dashed border-border/40">
              <CheckCircle className="h-12 w-12 mb-3 text-emerald-500/40" />
              <p className="font-semibold">Aucune demande en attente</p>
              <p className="text-sm mt-1 text-muted-foreground/60">Toutes les demandes ont été traitées.</p>
            </motion.div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
              {pendingQueue.map((req) => (
                <motion.div key={req.id} variants={fadeUp} layout
                  className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-amber-500/10 text-amber-600 font-semibold text-sm">
                        {req.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{req.name}</p>
                      <p className="text-xs text-muted-foreground">{req.email}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{req.school}</span>
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{req.subject}</span>
                        <span className="text-muted-foreground/50">·</span>
                        <span>{req.classes.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{req.date}</span>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                        onClick={() => setApproved(prev => [...prev, req.id])}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />Approuver
                      </Button>
                      <Button
                        size="sm" variant="destructive" className="h-8 text-xs gap-1.5"
                        onClick={() => setRejectTarget(req)}
                      >
                        <XCircle className="h-3.5 w-3.5" />Rejeter
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />Rejeter la demande
            </DialogTitle>
            <DialogDescription>
              La demande de rattachement de <strong>{rejectTarget?.name}</strong> sera rejetée. Indiquez la raison.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Motif du rejet <span className="text-destructive">*</span></Label>
            <Textarea
              rows={3}
              placeholder="Expliquez pourquoi la demande est rejetée (envoyé à l'enseignant)…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Annuler</Button>
            <Button variant="destructive" disabled={!rejectReason.trim()} onClick={confirmReject}>Confirmer le rejet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
