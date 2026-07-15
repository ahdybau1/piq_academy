'use client';

import React, { useState } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { GripVertical, Plus, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, BookOpen, User, Library, Star, Settings2, Eye, RotateCcw, Pencil, Trash2, TrendingDown, Users, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

interface OnboardingStep {
  id: string;
  title: string;
  desc: string;
  mandatory: boolean;
  completionRate: number;
  icon: React.ReactNode;
}

const STEP_ICONS: React.ReactNode[] = [
  <Star key="star" className="h-4 w-4" />,
  <User key="user" className="h-4 w-4" />,
  <Library key="library" className="h-4 w-4" />,
  <BookOpen key="book" className="h-4 w-4" />,
  <Settings2 key="settings" className="h-4 w-4" />,
];

const INITIAL_STEPS: OnboardingStep[] = [
  { id: 's1', title: 'Bienvenue sur PIQ Academy', desc: "Présentation de la plateforme, des objectifs et du parcours d'apprentissage.", mandatory: true, completionRate: 97, icon: STEP_ICONS[0] },
  { id: 's2', title: 'Configurer son profil', desc: 'Choix de la classe, des matières principales et des préférences de langue.', mandatory: true, completionRate: 91, icon: STEP_ICONS[1] },
  { id: 's3', title: 'Découvrir la bibliothèque', desc: 'Navigation entre cours, chapitres, leçons et ressources téléchargeables.', mandatory: false, completionRate: 76, icon: STEP_ICONS[2] },
  { id: 's4', title: 'Faire son premier exercice', desc: 'Compléter un exercice de démonstration pour découvrir le système de score.', mandatory: false, completionRate: 58, icon: STEP_ICONS[3] },
  { id: 's5', title: 'Activer les notifications', desc: 'Recevoir les rappels de cours, alertes de résultats et annonces importantes.', mandatory: false, completionRate: 44, icon: STEP_ICONS[4] },
];

const ABANDONMENT_STEP = 'Étape 3 — Bibliothèque';

export function OnboardingPage() {
  const [steps, setSteps] = useState<OnboardingStep[]>(INITIAL_STEPS);
  const [addOpen, setAddOpen] = useState(false);
  const [editStep, setEditStep] = useState<OnboardingStep | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OnboardingStep | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMandatory, setNewMandatory] = useState(false);

  const globalCompletion = Math.round(steps.reduce((s, st) => s + st.completionRate, 0) / steps.length);
  const mandatoryDone = steps.filter((s) => s.mandatory).every((s) => s.completionRate > 80);

  function toggleMandatory(id: string) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, mandatory: !s.mandatory } : s)));
  }

  function openAdd() {
    setNewTitle('');
    setNewDesc('');
    setNewMandatory(false);
    setAddOpen(true);
  }
  function openEdit(step: OnboardingStep) {
    setNewTitle(step.title);
    setNewDesc(step.desc);
    setNewMandatory(step.mandatory);
    setEditStep(step);
  }
  function saveAdd() {
    if (!newTitle.trim()) return;
    setSteps((prev) => [
      ...prev,
      {
        id: `s${Date.now()}`,
        title: newTitle.trim(),
        desc: newDesc.trim(),
        mandatory: newMandatory,
        completionRate: 0,
        icon: STEP_ICONS[prev.length % STEP_ICONS.length],
      },
    ]);
    setAddOpen(false);
  }
  function saveEdit() {
    if (!editStep || !newTitle.trim()) return;
    setSteps((prev) => prev.map((s) => (s.id === editStep.id ? { ...s, title: newTitle.trim(), desc: newDesc.trim(), mandatory: newMandatory } : s)));
    setEditStep(null);
  }
  function confirmDelete() {
    if (!deleteTarget) return;
    setSteps((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader
        title="Guide d'onboarding"
        description="Configuration du tutoriel d'accueil des élèves — étapes, ordre et taux de complétion."
        breadcrumbs={[{ label: 'Système' }, { label: "Guide d'onboarding" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Réactiver pour tous
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Prévisualiser
            </Button>
            <Button size="sm" className="gap-2" onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Ajouter une étape
            </Button>
          </div>
        }
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-4">
        {[
          {
            label: 'Taux de complétion global',
            value: `${globalCompletion}%`,
            sub: 'Moyenne sur toutes les étapes',
            icon: <CheckCircle2 className="h-5 w-5" />,
            bg: 'bg-emerald-500/10',
            color: 'text-emerald-500',
            progress: globalCompletion,
          },
          {
            label: 'Étapes configurées',
            value: String(steps.length),
            sub: `${steps.filter((s) => s.mandatory).length} obligatoires`,
            icon: <LayoutList className="h-5 w-5" />,
            bg: 'bg-blue-500/10',
            color: 'text-blue-500',
            progress: null,
          },
          {
            label: 'Abandon fréquent',
            value: ABANDONMENT_STEP.split('—')[0].trim(),
            sub: ABANDONMENT_STEP,
            icon: <TrendingDown className="h-5 w-5" />,
            bg: 'bg-amber-500/10',
            color: 'text-amber-500',
            progress: null,
          },
          {
            label: 'Élèves ayant terminé',
            value: '2 841',
            sub: 'Ce mois-ci',
            icon: <Users className="h-5 w-5" />,
            bg: 'bg-violet-500/10',
            color: 'text-violet-500',
            progress: null,
          },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{kpi.label}</p>
                <p className="mt-2 truncate text-2xl font-bold">{kpi.value}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{kpi.sub}</p>
              </div>
              <div className={cn('ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', kpi.bg, kpi.color)}>{kpi.icon}</div>
            </div>
            {kpi.progress !== null && <Progress value={kpi.progress} className="mt-3 h-1.5" />}
          </motion.div>
        ))}
      </motion.div>

      {!mandatoryDone && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Taux faible sur une étape obligatoire</p>
            <p className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-400/80">
              Au moins une étape marquée &laquo; obligatoire &raquo; a un taux de complétion inférieur à 80 %. Envisagez de la simplifier ou de la rendre optionnelle.
            </p>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Étapes du guide ({steps.length})</h2>

        <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
          <AnimatePresence>
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                variants={rowItem}
                layout
                exit={{ opacity: 0, x: -12, transition: { duration: 0.2 } }}
                className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
              >
                <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-muted-foreground/20 transition-colors active:cursor-grabbing group-hover:text-muted-foreground/50" />

                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {step.icon}
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-border/40 bg-muted text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{step.title}</p>
                    {step.mandatory && (
                      <Badge className="border-0 bg-rose-100 text-[10px] text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">Obligatoire</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{step.desc}</p>

                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="max-w-[180px] flex-1">
                      <Progress value={step.completionRate} className="h-1.5" />
                    </div>
                    <span
                      className={cn(
                        'text-[11px] font-semibold tabular-nums',
                        step.completionRate >= 80
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : step.completionRate >= 50
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                      )}
                    >
                      {step.completionRate}%
                    </span>
                    <span className="text-[11px] text-muted-foreground/60">complétion</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-muted-foreground sm:block">Obligatoire</span>
                    <Switch checked={step.mandatory} onCheckedChange={() => toggleMandatory(step.id)} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(step)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
                      onClick={() => setDeleteTarget(step)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {(addOpen || !!editStep) && (
        <Dialog
          open
          onOpenChange={() => {
            setAddOpen(false);
            setEditStep(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editStep ? "Modifier l'étape" : 'Nouvelle étape'}</DialogTitle>
              <DialogDescription>
                {editStep ? 'Modifiez le titre, la description et le caractère obligatoire.' : "Ajoutez une nouvelle étape au guide d'onboarding."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input placeholder="ex: Découvrir les quiz" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Courte description visible par l'élève…" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Étape obligatoire</p>
                  <p className="text-xs text-muted-foreground">L&apos;élève ne peut pas passer cette étape</p>
                </div>
                <Switch checked={newMandatory} onCheckedChange={setNewMandatory} />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAddOpen(false);
                  setEditStep(null);
                }}
              >
                Annuler
              </Button>
              <Button onClick={editStep ? saveEdit : saveAdd} disabled={!newTitle.trim()}>
                {editStep ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette étape ?</DialogTitle>
            <DialogDescription>&laquo; {deleteTarget?.title} &raquo; sera retirée du guide. Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
