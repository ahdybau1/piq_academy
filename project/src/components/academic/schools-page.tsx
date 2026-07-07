'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2, Plus, Search, CheckCircle2, XCircle,
  ChevronRight, Home, MapPin, FileText, ArrowLeft, Globe,
} from 'lucide-react';
import { MOCK_SCHOOLS } from '@/lib/mock-data';
import { useApp } from '@/lib/app-context';
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

// ── Mock exam data ─────────────────────────────────────────────────────────

const MOCK_SCHOOL_EXAMS = [
  { id: 'se1', schoolId: 'sch1', schoolName: 'Lycée Général Leclerc', class: 'Terminale C', subject: 'Mathématiques', year: 2024, status: 'approved', submittedBy: 'Jean-Baptiste Mba', submittedAt: '2024-12-01', hasCorrection: true },
  { id: 'se2', schoolId: 'sch2', schoolName: 'Lycée Général de Douala', class: '1ère D', subject: 'Physique-Chimie', year: 2024, status: 'pending', submittedBy: 'Marie-Claire Atangana', submittedAt: '2024-12-08', hasCorrection: false },
  { id: 'se3', schoolId: 'sch3', schoolName: 'Collège Libermann', class: '3ème', subject: 'Français', year: 2024, status: 'rejected', submittedBy: 'Paul Etoundi', submittedAt: '2024-12-05', hasCorrection: true, reason: 'Qualité du scan insuffisante' },
  { id: 'se4', schoolId: 'sch1', schoolName: 'Lycée Général Leclerc', class: 'Terminale D', subject: 'SVT', year: 2024, status: 'pending', submittedBy: 'Emmanuel Nkodo', submittedAt: '2024-12-10', hasCorrection: false },
];

const EXAM_STATUS = {
  pending: { label: 'En attente', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  approved: { label: 'Approuvée', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  rejected: { label: 'Rejetée', dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
} as const;

type School = typeof MOCK_SCHOOLS[number];

// ── KPI card ──────────────────────────────────────────────────────────────────

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

// ── Tab button ────────────────────────────────────────────────────────────────

function TabBtn({ active, badge, onClick, children }: {
  active: boolean; badge?: number; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
        active ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 tabular-nums">
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SchoolsPage() {
  const { selectedCountry } = useApp();
  const [tab, setTab] = useState<'schools' | 'exams'>('schools');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<School | null>(null);
  const [dir, setDir] = useState<Dir>('forward');
  const [showCreate, setShowCreate] = useState(false);

  const schools = MOCK_SCHOOLS.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase())
  );
  const pendingExams = MOCK_SCHOOL_EXAMS.filter((e) => e.status === 'pending');
  const schoolExams = selected ? MOCK_SCHOOL_EXAMS.filter((e) => e.schoolId === selected.id) : [];

  const openSchool = (s: School) => { setDir('forward'); setSelected(s); };
  const closeSchool = () => { setDir('back'); setSelected(null); };

  // ── LEVEL 0 — Liste + Épreuves ────────────────────────────────────────────

  const ListLevel = (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3 pb-2">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span>Académique</span>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80">Établissements</span>
        </nav>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Établissements & Épreuves</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Gestion des établissements et épreuves soumises</p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Nouvel établissement
          </Button>
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      {/* Country context banner */}
      {selectedCountry ? (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/30">
          <Globe className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-800 dark:text-blue-300">Périmètre actif : <strong>{selectedCountry.name}</strong></span>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30">
          <Globe className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-800 dark:text-amber-300">Sélectionnez un pays via le menu en haut de page pour filtrer les établissements.</span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard icon={<Building2 className="h-5 w-5 text-primary/80" />} label="Total" value={MOCK_SCHOOLS.length} color="bg-primary/10" />
        <KpiCard icon={<Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />} label="Publics" value={MOCK_SCHOOLS.filter((s) => s.type === 'public').length} color="bg-blue-500/10" />
        <KpiCard icon={<Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />} label="Privés" value={MOCK_SCHOOLS.filter((s) => s.type === 'private').length} color="bg-violet-500/10" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-2xl border border-border/40 bg-card p-1.5 shadow-sm w-fit">
        <TabBtn active={tab === 'schools'} onClick={() => setTab('schools')}>
          <Building2 className="h-4 w-4" />
          Établissements
        </TabBtn>
        <TabBtn active={tab === 'exams'} badge={pendingExams.length} onClick={() => setTab('exams')}>
          <FileText className="h-4 w-4" />
          Épreuves en attente
        </TabBtn>
      </div>

      {tab === 'schools' && (
        <>
          {/* Search */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input className="pl-9" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
            {schools.map((s) => (
              <motion.button
                key={s.id}
                variants={rowItem}
                onClick={() => openSchool(s)}
                className="group w-full rounded-2xl border border-border/40 bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                    <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground transition-colors group-hover:text-primary">{s.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {s.city}
                      <span className="opacity-40">·</span>
                      {s.type === 'public' ? 'Public' : 'Privé'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                      s.active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    )}>
                      {s.active ? 'Actif' : 'Inactif'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/50" />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </>
      )}

      {tab === 'exams' && (
        <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
          {MOCK_SCHOOL_EXAMS.map((exam) => {
            const sc = EXAM_STATUS[exam.status as keyof typeof EXAM_STATUS] ?? EXAM_STATUS.pending;
            return (
              <motion.div
                key={exam.id}
                variants={rowItem}
                className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                      <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{exam.schoolName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {exam.class} · {exam.subject} · soumis le {exam.submittedAt}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Par {exam.submittedBy}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', sc.badge)}>
                      {sc.label}
                    </span>
                    <span className={cn('text-[11px] font-medium',
                      exam.hasCorrection ? 'text-emerald-600' : 'text-muted-foreground'
                    )}>
                      {exam.hasCorrection ? '✓ Correction' : 'Sans correction'}
                    </span>
                    {exam.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );

  // ── LEVEL 1 — Détail établissement ────────────────────────────────────────

  const DetailLevel = selected && (
    <div className="space-y-6">
      <div className="space-y-3">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <button className="hover:text-foreground transition-colors" onClick={closeSchool}>Établissements</button>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80 max-w-[200px] truncate">{selected.name}</span>
        </nav>
        <div className="flex items-start gap-3">
          <button
            onClick={closeSchool}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{selected.name}</h1>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {selected.city} · {selected.type === 'public' ? 'Établissement public' : 'Établissement privé'}
            </p>
          </div>
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      {/* School details */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
        <dl className="space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Statut</dt>
            <dd>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold',
                selected.active
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              )}>
                {selected.active ? 'Actif' : 'Inactif'}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Type</dt>
            <dd className="text-sm font-semibold">{selected.type === 'public' ? 'Public' : 'Privé'}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Ville</dt>
            <dd className="text-sm font-semibold">{selected.city}</dd>
          </div>
        </dl>
      </div>

      {/* Exams for this school */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Épreuves ({schoolExams.length})</p>
        {schoolExams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
            <FileText className="mb-2 h-8 w-8" />
            <p className="text-sm">Aucune épreuve soumise</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schoolExams.map((exam) => {
              const sc = EXAM_STATUS[exam.status as keyof typeof EXAM_STATUS] ?? EXAM_STATUS.pending;
              return (
                <div key={exam.id} className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{exam.class} — {exam.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{exam.submittedAt}</p>
                    </div>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', sc.badge)}>
                      {sc.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected ? 'detail' : 'list'}
            variants={slide(dir)}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {selected ? DetailLevel : ListLevel}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel établissement</DialogTitle>
            <DialogDescription>Ajoutez un établissement scolaire au système.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nom</Label>
              <Input className="mt-1" placeholder="Ex : Lycée Général de Douala" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ville</Label>
                <Input className="mt-1" placeholder="Ex : Douala" />
              </div>
              <div>
                <Label>Type</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button onClick={() => setShowCreate(false)}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
