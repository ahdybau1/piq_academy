'use client';

import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Layers, FileText, Plus, X, ChevronRight, Send, Clock as Unlock, ArrowLeft, Hop as Home, Search, Tag, Pencil, ChevronUp, ChevronDown, ListChecks, Trash2, TriangleAlert as AlertTriangle } from 'lucide-react';
import { HierarchicalNodeSelect } from './hierarchical-node-select';
import {
  fetchSubjects,
  fetchSubjectsForClass,
  createSubject,
  updateSubject,
  deleteSubject,
  fetchSubjectClassLinks,
  addSubjectClassLink,
  removeSubjectClassLink,
  fetchChapters,
  createChapter,
  updateChapter,
  moveChapter,
  deleteChapter,
  fetchTerms,
  fetchEstablishments,
  fetchChapterUnlocks,
  createChapterUnlock,
  deleteChapterUnlock,
  fetchLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  moveLesson,
  submitForValidation,
  fetchCatalog,
} from '@/lib/content/api-client';
import {
  fetchExercises,
  createExercise,
  updateExercise,
  moveExercise,
  deleteExercise,
  submitExerciseForValidation,
} from '@/lib/exercises/api-client';
import { EXERCISE_TYPES, EXERCISE_DIFFICULTIES, EXERCISE_FORMATS, MIN_SUBSCRIPTION_TIERS } from '@/lib/exercises/constants';
import { fetchAcademicNodes } from '@/lib/academic/api-client';
import { useWorkingClass } from '@/lib/working-class-context';
import { CONTENT_STATUS_LABELS } from '@/lib/content/constants';
import type {
  SubjectRow,
  ChapterRow,
  LessonWithStatus,
  SubjectClassLinkItem,
  TermRow,
  EstablishmentRow,
  ChapterUnlockItem,
  CatalogEntryRow,
} from '@/lib/content/types';
import type {
  ExerciseAttachment,
  ExerciseWithStatus,
  ExerciseType,
  ExerciseDifficulty,
  ExerciseFormat,
  MinSubscriptionTier,
} from '@/lib/exercises/types';
import type { AcademicNodeRow } from '@/lib/academic/types';
import { cn } from '@/lib/utils';
import type { JSONContent } from '@tiptap/react';
import { RichLessonEditor, EMPTY_LESSON_DOC, toEditorDoc } from '@/components/editor/rich-lesson-editor';

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
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const STATUS_BADGE: Record<string, string> = {
  brouillon: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  en_attente_de_validation: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  a_corriger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  rejete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  publie: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const EXERCISE_TYPE_ITEMS = Object.fromEntries(EXERCISE_TYPES.map((t) => [t.value, t.label]));
const EXERCISE_DIFFICULTY_ITEMS = Object.fromEntries(EXERCISE_DIFFICULTIES.map((d) => [d.value, d.label]));
const EXERCISE_FORMAT_ITEMS = Object.fromEntries(EXERCISE_FORMATS.map((f) => [f.value, f.label]));
const MIN_TIER_ITEMS = Object.fromEntries(MIN_SUBSCRIPTION_TIERS.map((t) => [t.value, t.label]));
const EXERCISE_TYPE_LABELS = new Map(EXERCISE_TYPES.map((t) => [t.value, t.label]));
const EXERCISE_DIFFICULTY_LABELS = new Map(EXERCISE_DIFFICULTIES.map((d) => [d.value, d.label]));
const EXERCISE_FORMAT_LABELS = new Map(EXERCISE_FORMATS.map((f) => [f.value, f.label]));
const MIN_TIER_LABELS = new Map(MIN_SUBSCRIPTION_TIERS.map((t) => [t.value, t.label]));

/** Contenu d'un exercice : énoncé + correction, chacun un document riche indépendant (même éditeur que les leçons). */
interface ExerciseContent {
  statement?: JSONContent;
  correction?: JSONContent;
}

/**
 * Gère la liste + le formulaire de création/édition des exercices d'un rattachement
 * donné (leçon, chapitre ou matière — section 2.4). Réutilisé aux 3 niveaux plutôt que
 * dupliqué : la logique CRUD/réordonnancement/soumission est strictement identique,
 * seul l'`attachment` transmis à l'API change.
 */
function ExerciseManager({
  attachment,
  subjectId,
  classNodeId,
  heading,
  emptyLabel,
}: {
  attachment: ExerciseAttachment;
  subjectId: string;
  /** Un média inséré dans l'énoncé/correction est toujours rattaché à cette classe/série. */
  classNodeId: string;
  heading: string;
  emptyLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [exercises, setExercises] = useState<ExerciseWithStatus[]>([]);
  const [catalogEntries, setCatalogEntries] = useState<CatalogEntryRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<ExerciseType>('entrainement');
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty | ''>('');
  const [format, setFormat] = useState<ExerciseFormat>('qcm');
  const [tier, setTier] = useState<MinSubscriptionTier>('gratuit');
  const [catalogId, setCatalogId] = useState('');
  const [statement, setStatement] = useState<JSONContent>(EMPTY_LESSON_DOC);
  const [correction, setCorrection] = useState<JSONContent>(EMPTY_LESSON_DOC);
  // Tiptap ne lit `content` qu'au montage — sans remontage forcé, rouvrir le formulaire
  // (créer après annuler, ou éditer un autre exercice) laisserait l'éditeur affiché à
  // son ancien contenu au lieu du nouveau. On force un nouvel éditeur à chaque ouverture.
  const [formInstanceKey, setFormInstanceKey] = useState(0);

  const refresh = () => fetchExercises(attachment).then(setExercises).catch((e) => setError(e.message));

  const attachmentKey = JSON.stringify(attachment);
  useEffect(() => {
    refresh();
    fetchCatalog(subjectId).then(setCatalogEntries).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachmentKey, subjectId]);

  const isRunningRef = useRef(false);
  const run = (fn: () => Promise<{ error?: string }>, cb?: () => void) => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const r = await fn();
        if (r.error) {
          setError(r.error);
          return;
        }
        cb?.();
      } finally {
        isRunningRef.current = false;
      }
    });
  };

  const startCreate = () => {
    setEditingId(null);
    setType('entrainement');
    setDifficulty('');
    setFormat('qcm');
    setTier('gratuit');
    setCatalogId('');
    setStatement(EMPTY_LESSON_DOC);
    setCorrection(EMPTY_LESSON_DOC);
    setFormInstanceKey((k) => k + 1);
    setShowForm(true);
  };

  const startEdit = (ex: ExerciseWithStatus) => {
    setEditingId(ex.id);
    setType(ex.type);
    setDifficulty(ex.difficulty ?? '');
    setFormat(ex.format);
    setTier(ex.min_subscription_tier);
    setCatalogId(ex.catalog_id ?? '');
    const content = (ex.content_json ?? {}) as ExerciseContent;
    setStatement(toEditorDoc(content.statement ?? null));
    setCorrection(toEditorDoc(content.correction ?? null));
    setFormInstanceKey((k) => k + 1);
    setShowForm(true);
  };

  const cancelForm = () => setShowForm(false);

  return (
    <div className="space-y-3 rounded-2xl border border-border/40 bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <ListChecks className="h-4 w-4 text-muted-foreground" />
          {heading}
        </p>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={startCreate}>
          <Plus className="h-3.5 w-3.5" />
          Nouvel exercice
        </Button>
      </div>

      {error && <ErrorBanner msg={error} />}

      <Dialog open={showForm} onOpenChange={(open) => !open && cancelForm()}>
        <DialogContent className="overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier l'exercice" : 'Créer un exercice'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Type</Label>
                <Select items={EXERCISE_TYPE_ITEMS} value={type} onValueChange={(v) => v && setType(v as ExerciseType)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulté</Label>
                <Select
                  items={EXERCISE_DIFFICULTY_ITEMS}
                  value={difficulty}
                  onValueChange={(v) => setDifficulty((v as ExerciseDifficulty) ?? '')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_DIFFICULTIES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Format</Label>
                <Select items={EXERCISE_FORMAT_ITEMS} value={format} onValueChange={(v) => v && setFormat(v as ExerciseFormat)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_FORMATS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Palier d&apos;abonnement minimum</Label>
              <Select items={MIN_TIER_ITEMS} value={tier} onValueChange={(v) => v && setTier(v as MinSubscriptionTier)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MIN_SUBSCRIPTION_TIERS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type pédagogique (catalogue)</Label>
              <Select
                items={Object.fromEntries(catalogEntries.map((c) => [c.id, c.element_type]))}
                value={catalogId}
                onValueChange={(v) => setCatalogId(v ?? '')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  {catalogEntries.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.element_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Énoncé</Label>
              <div className="mt-1">
                <RichLessonEditor key={`stmt-${formInstanceKey}`} content={statement} onChange={setStatement} classNodeId={classNodeId} />
              </div>
            </div>
            <div>
              <Label>Correction</Label>
              <div className="mt-1">
                <RichLessonEditor key={`corr-${formInstanceKey}`} content={correction} onChange={setCorrection} classNodeId={classNodeId} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={cancelForm}>
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => {
                const contentJson: ExerciseContent = { statement, correction };
                const payload = {
                  type,
                  difficulty: difficulty || null,
                  format,
                  minSubscriptionTier: tier,
                  catalogId: catalogId || null,
                  contentJson: contentJson as unknown as Record<string, unknown>,
                };
                if (editingId) {
                  run(() => updateExercise({ id: editingId, ...payload }), () => {
                    cancelForm();
                    refresh();
                  });
                } else {
                  run(() => createExercise({ attachment, ...payload }), () => {
                    cancelForm();
                    refresh();
                  });
                }
              }}
            >
              {editingId ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {exercises.map((ex, idx) => {
          const status = ex.latestVersion?.status ?? 'brouillon';
          const canSubmit = status === 'brouillon' || status === 'a_corriger';
          return (
            <div key={ex.id} className="group flex items-center gap-2 rounded-xl border border-border/40 bg-card p-3">
              <div className="flex shrink-0 flex-col">
                <button
                  disabled={idx === 0}
                  onClick={() => run(() => moveExercise({ id: ex.id, direction: 'up', attachment }), refresh)}
                  className="rounded p-0.5 text-muted-foreground/50 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
                  title="Monter"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  disabled={idx === exercises.length - 1}
                  onClick={() => run(() => moveExercise({ id: ex.id, direction: 'down', attachment }), refresh)}
                  className="rounded p-0.5 text-muted-foreground/50 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
                  title="Descendre"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{EXERCISE_FORMAT_LABELS.get(ex.format) ?? ex.format}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {EXERCISE_TYPE_LABELS.get(ex.type) ?? ex.type}
                  </span>
                  {ex.difficulty && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {EXERCISE_DIFFICULTY_LABELS.get(ex.difficulty) ?? ex.difficulty}
                    </span>
                  )}
                  <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', STATUS_BADGE[status])}>
                    {CONTENT_STATUS_LABELS[status] ?? status}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Palier : {MIN_TIER_LABELS.get(ex.min_subscription_tier) ?? ex.min_subscription_tier}
                  </span>
                </div>
              </div>
              <button
                onClick={() => startEdit(ex)}
                className="shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                title="Modifier"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {canSubmit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                  onClick={() => run(() => submitExerciseForValidation({ exerciseId: ex.id }), refresh)}
                >
                  <Send className="h-3.5 w-3.5" />
                  Soumettre
                </Button>
              )}
              <button
                onClick={() => run(() => deleteExercise({ id: ex.id }), refresh)}
                className="shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                title="Supprimer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
        {exercises.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground/60">{emptyLabel}</p>}
      </div>
    </div>
  );
}

function BackBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card shadow-sm transition-all group-hover:border-primary/30 group-hover:bg-primary/5">
        <ArrowLeft className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </button>
  );
}

function Crumb({ parts }: { parts: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground">
      <Home className="h-3 w-3" />
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="h-3 w-3 opacity-30" />
          {p.onClick ? (
            <button className="transition-colors hover:text-foreground" onClick={p.onClick}>
              {p.label}
            </button>
          ) : (
            <span className="font-medium text-foreground/80">{p.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function LevelHeader({
  crumbs,
  title,
  subtitle,
  back,
  actions,
  backLabel,
}: {
  crumbs: { label: string; onClick?: () => void }[];
  title: string;
  subtitle?: string;
  back?: () => void;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 pb-6">
      <Crumb parts={crumbs} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {back && <BackBtn label={backLabel ?? 'Retour'} onClick={back} />}
          <div>
            <h1 className={cn('font-bold tracking-tight', back ? 'text-xl' : 'text-2xl')}>{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className="relative h-px w-full bg-border/40">
        <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
      </div>
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
      <X className="h-4 w-4 shrink-0" />
      {msg}
    </div>
  );
}

function CollapseForm({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }}
          exit={{ height: 0, opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] } }}
          className="overflow-hidden"
        >
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/[0.03] p-5 shadow-sm">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ContentPageView({
  initialSubjects,
  countryId,
}: {
  initialSubjects: SubjectRow[];
  countryId: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  const [subjects, setSubjects] = useState(initialSubjects);
  const [error, setError] = useState<string | null>(null);

  type Level = 0 | 1 | 2;
  const [level, setLevel] = useState<Level>(0);
  const [dir, setDir] = useState<Dir>('forward');

  function goTo(l: Level, d: Dir) {
    setDir(d);
    setLevel(l);
  }

  // `initialSubjects` vient du Server Component et reflète déjà le pays sélectionné ;
  // un changement de pays (switchCountry -> router.refresh()) ne remonte pas ce
  // composant, donc on resynchronise l'état local pendant le rendu (pattern React
  // officiel pour réinitialiser un state dérivé d'une prop, plutôt qu'un effet).
  const [prevInitialSubjects, setPrevInitialSubjects] = useState(initialSubjects);
  if (initialSubjects !== prevInitialSubjects) {
    setPrevInitialSubjects(initialSubjects);
    setSubjects(initialSubjects);
  }

  const [academicNodes, setAcademicNodes] = useState<AcademicNodeRow[] | null>(null);
  useEffect(() => {
    fetchAcademicNodes(countryId ?? undefined)
      .then(setAcademicNodes)
      .catch((e) => setError(e.message));
  }, [countryId]);

  const nodeById = useMemo(() => new Map((academicNodes ?? []).map((n) => [n.id, n])), [academicNodes]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [subjectClassLinks, setSubjectClassLinks] = useState<SubjectClassLinkItem[]>([]);
  const [catalogEntries, setCatalogEntries] = useState<CatalogEntryRow[]>([]);
  const [terms, setTerms] = useState<TermRow[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentRow[]>([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  // Filtre par classe/série (section 2.1) : sans lui, des matières de même nom pour des
  // classes différentes (ex. "Mathématiques" en Première C et en Première D, contenus
  // distincts) se retrouvent mélangées dans une liste plate sans distinction claire.
  // Préremplit depuis la « classe de travail » du header (barre du haut) : si l'admin
  // change de classe là-bas, ce filtre se resynchronise ; un choix local ici reste
  // possible tant que la classe de travail ne change pas.
  const { workingClassNodeId } = useWorkingClass();
  const [filterClassNodeId, setFilterClassNodeId] = useState(workingClassNodeId ?? '');
  const [classScopedSubjects, setClassScopedSubjects] = useState<SubjectRow[]>([]);
  const [prevFilterClassNodeId, setPrevFilterClassNodeId] = useState(filterClassNodeId);
  if (filterClassNodeId !== prevFilterClassNodeId) {
    setPrevFilterClassNodeId(filterClassNodeId);
    if (!filterClassNodeId) setClassScopedSubjects([]);
  }
  const [prevWorkingClassNodeId, setPrevWorkingClassNodeId] = useState(workingClassNodeId);
  if (workingClassNodeId !== prevWorkingClassNodeId) {
    setPrevWorkingClassNodeId(workingClassNodeId);
    setFilterClassNodeId(workingClassNodeId ?? '');
  }
  useEffect(() => {
    if (!filterClassNodeId) return;
    fetchSubjectsForClass(filterClassNodeId).then(setClassScopedSubjects).catch((e) => setError(e.message));
  }, [filterClassNodeId]);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectNodeId, setNewSubjectNodeId] = useState('');
  const [newSubjectAdditionalClassNodeIds, setNewSubjectAdditionalClassNodeIds] = useState<string[]>([]);
  const [pendingSubjectCascadeId, setPendingSubjectCascadeId] = useState<string | null>(null);

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonWithStatus[]>([]);
  const [chapterUnlocks, setChapterUnlocks] = useState<ChapterUnlockItem[]>([]);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterIntroduction, setNewChapterIntroduction] = useState('');
  const [newChapterTermId, setNewChapterTermId] = useState('');
  const [newUnlockEstablishmentId, setNewUnlockEstablishmentId] = useState('');
  const [pendingChapterCascadeId, setPendingChapterCascadeId] = useState<string | null>(null);

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState<JSONContent>(EMPTY_LESSON_DOC);
  const [newLessonCatalogId, setNewLessonCatalogId] = useState('');
  // Voir le commentaire équivalent dans ExerciseManager : force un nouvel éditeur Tiptap
  // à chaque ouverture du formulaire pour éviter qu'un contenu précédent (annulé ou d'une
  // autre leçon) ne reste affiché puisque Tiptap ne relit pas `content` après le montage.
  const [lessonFormInstanceKey, setLessonFormInstanceKey] = useState(0);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [pendingLessonCascadeId, setPendingLessonCascadeId] = useState<string | null>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) ?? null;
  const selectedChapter = chapters.find((c) => c.id === selectedChapterId) ?? null;
  const subjectCountryId = selectedSubject ? nodeById.get(selectedSubject.node_id)?.country_id ?? null : null;

  const refreshSubjects = () => fetchSubjects(countryId ?? undefined).then(setSubjects).catch((e) => setError(e.message));
  const refreshChapters = (id: string) => fetchChapters(id).then(setChapters).catch((e) => setError(e.message));
  const refreshLinks = (id: string) => fetchSubjectClassLinks(id).then(setSubjectClassLinks).catch((e) => setError(e.message));
  const refreshCatalog = (id: string) => fetchCatalog(id).then(setCatalogEntries).catch((e) => setError(e.message));
  const refreshLessons = (id: string) => fetchLessons(id).then(setLessons).catch((e) => setError(e.message));
  const refreshUnlocks = (id: string) => fetchChapterUnlocks(id).then(setChapterUnlocks).catch((e) => setError(e.message));

  useEffect(() => {
    if (!selectedSubjectId) return;
    refreshChapters(selectedSubjectId);
    refreshLinks(selectedSubjectId);
    refreshCatalog(selectedSubjectId);
  }, [selectedSubjectId]);

  useEffect(() => {
    if (!subjectCountryId) return;
    fetchTerms(subjectCountryId).then(setTerms).catch((e) => setError(e.message));
    fetchEstablishments(subjectCountryId).then(setEstablishments).catch((e) => setError(e.message));
  }, [subjectCountryId]);

  useEffect(() => {
    if (!selectedChapterId) return;
    refreshLessons(selectedChapterId);
    refreshUnlocks(selectedChapterId);
  }, [selectedChapterId]);

  const isRunningRef = useRef(false);
  const run = (fn: () => Promise<{ error?: string }>, cb?: () => void) => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const r = await fn();
        if (r.error) {
          setError(r.error);
          return;
        }
        cb?.();
      } finally {
        isRunningRef.current = false;
      }
    });
  };

  const startCreateSubject = () => {
    setEditingSubjectId(null);
    setNewSubjectName('');
    setNewSubjectNodeId('');
    setNewSubjectAdditionalClassNodeIds([]);
    setShowSubjectForm(true);
  };

  const startEditSubject = (s: SubjectRow) => {
    setEditingSubjectId(s.id);
    setNewSubjectName(s.name);
    setNewSubjectNodeId(s.node_id);
    setShowSubjectForm(true);
  };

  const cancelSubjectForm = () => {
    setShowSubjectForm(false);
    setEditingSubjectId(null);
    setNewSubjectName('');
    setNewSubjectNodeId('');
    setNewSubjectAdditionalClassNodeIds([]);
  };

  const openSubject = (id: string) => {
    setSelectedSubjectId(id);
    setChapters([]);
    setSubjectClassLinks([]);
    setSelectedChapterId(null);
    setLessons([]);
    setChapterUnlocks([]);
    setTerms([]);
    setEstablishments([]);
    setPendingChapterCascadeId(null);
    cancelChapterForm();
    goTo(1, 'forward');
  };

  const openChapter = (id: string) => {
    setSelectedChapterId(id);
    setLessons([]);
    setChapterUnlocks([]);
    setExpandedLessonId(null);
    setPendingLessonCascadeId(null);
    cancelLessonForm();
    goTo(2, 'forward');
  };

  const startCreateLesson = () => {
    setEditingLessonId(null);
    setNewLessonTitle('');
    setNewLessonContent(EMPTY_LESSON_DOC);
    setNewLessonCatalogId('');
    setLessonFormInstanceKey((k) => k + 1);
    setShowLessonForm(true);
  };

  const startEditLesson = (lesson: LessonWithStatus) => {
    setEditingLessonId(lesson.id);
    setNewLessonTitle(lesson.title);
    setNewLessonContent(toEditorDoc(lesson.content_json));
    setNewLessonCatalogId(lesson.catalog_id ?? '');
    setLessonFormInstanceKey((k) => k + 1);
    setShowLessonForm(true);
  };

  const cancelLessonForm = () => {
    setShowLessonForm(false);
    setEditingLessonId(null);
    setNewLessonTitle('');
    setNewLessonContent(EMPTY_LESSON_DOC);
    setNewLessonCatalogId('');
  };

  const startCreateChapter = () => {
    setEditingChapterId(null);
    setNewChapterTitle('');
    setNewChapterIntroduction('');
    setNewChapterTermId('');
    setShowChapterForm(true);
  };

  const startEditChapter = (ch: ChapterRow) => {
    setEditingChapterId(ch.id);
    setNewChapterTitle(ch.title);
    setNewChapterIntroduction(ch.introduction ?? '');
    setNewChapterTermId(ch.term_id);
    setShowChapterForm(true);
  };

  const cancelChapterForm = () => {
    setShowChapterForm(false);
    setEditingChapterId(null);
    setNewChapterTitle('');
    setNewChapterIntroduction('');
    setNewChapterTermId('');
  };

  const subjectsInScope = filterClassNodeId ? classScopedSubjects : subjects;
  const filteredSubjects = subjectSearch
    ? subjectsInScope.filter((s) => s.name.toLowerCase().includes(subjectSearch.toLowerCase()))
    : subjectsInScope;

  const chapterTermItems = Object.fromEntries(terms.map((t) => [t.id, `${t.name} — ${t.school_year}`]));
  const establishmentItems = Object.fromEntries(establishments.map((e) => [e.id, e.name]));

  const Level0 = (
    <div className="space-y-6">
      <LevelHeader
        crumbs={[{ label: 'Académique' }, { label: 'Contenu' }]}
        title="Matières & Contenu"
        subtitle="Sélectionnez une matière pour gérer ses chapitres et leçons"
        actions={
          <Button onClick={startCreateSubject} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle matière
          </Button>
        }
      />

      {error && <ErrorBanner msg={error} />}

      <CollapseForm open={showSubjectForm}>
        <p className="mb-4 text-sm font-semibold text-foreground">{editingSubjectId ? 'Modifier la matière' : 'Créer une matière'}</p>
        <div className="space-y-3">
          <div>
            <Label>Nom de la matière</Label>
            <Input className="mt-1" placeholder="ex. Mathématiques" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
          </div>
          {!editingSubjectId && countryId && (
            <>
              <HierarchicalNodeSelect
                nodes={academicNodes ?? []}
                countryId={countryId}
                value={newSubjectNodeId}
                onChange={setNewSubjectNodeId}
              />
              <div className="space-y-2">
                <Label>Classes liées (tronc commun)</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {newSubjectAdditionalClassNodeIds.map((id) => {
                    const node = (academicNodes ?? []).find((n) => n.id === id);
                    return (
                      <span key={id} className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/60 px-2.5 py-0.5 text-xs font-medium">
                        {node?.name ?? id}
                        <button onClick={() => setNewSubjectAdditionalClassNodeIds((prev) => prev.filter((x) => x !== id))}>
                          <X className="h-3 w-3 text-muted-foreground transition-colors hover:text-rose-600" />
                        </button>
                      </span>
                    );
                  })}
                  <HierarchicalNodeSelect
                    nodes={academicNodes ?? []}
                    countryId={countryId}
                    value=""
                    onChange={(id) => {
                      if (!id || id === newSubjectNodeId || newSubjectAdditionalClassNodeIds.includes(id)) return;
                      setNewSubjectAdditionalClassNodeIds((prev) => [...prev, id]);
                    }}
                    excludeLeafIds={newSubjectNodeId ? [newSubjectNodeId, ...newSubjectAdditionalClassNodeIds] : newSubjectAdditionalClassNodeIds}
                    compact
                  />
                </div>
              </div>
            </>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={cancelSubjectForm}>
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={isPending || !newSubjectName || (!editingSubjectId && !newSubjectNodeId)}
              onClick={() =>
                editingSubjectId
                  ? run(() => updateSubject({ id: editingSubjectId, name: newSubjectName }), () => {
                      cancelSubjectForm();
                      refreshSubjects();
                    })
                  : run(
                      () =>
                        createSubject({
                          name: newSubjectName,
                          nodeId: newSubjectNodeId,
                          additionalClassNodeIds: newSubjectAdditionalClassNodeIds,
                        }),
                      () => {
                        cancelSubjectForm();
                        refreshSubjects();
                      }
                    )
              }
            >
              {editingSubjectId ? 'Enregistrer' : 'Créer la matière'}
            </Button>
          </div>
        </div>
      </CollapseForm>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input className="pl-9" placeholder="Rechercher une matière…" value={subjectSearch} onChange={(e) => setSubjectSearch(e.target.value)} />
        </div>
        {countryId && (
          <HierarchicalNodeSelect nodes={academicNodes ?? []} countryId={countryId} value={filterClassNodeId} onChange={setFilterClassNodeId} compact />
        )}
        {filterClassNodeId && (
          <button onClick={() => setFilterClassNodeId('')} className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
            Toutes les classes
          </button>
        )}
      </div>

      <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" variants={stagger} initial="hidden" animate="show">
        {filteredSubjects.map((s) => {
          const className = nodeById.get(s.node_id)?.name ?? 'Classe supprimée';
          return (
            <motion.div
              key={s.id}
              variants={item}
              className="group relative w-full rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg"
            >
              <button onClick={() => openSubject(s.id)} className="w-full text-left">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/50" />
                </div>
                <div className="mt-4">
                  <p className="font-semibold text-foreground transition-colors group-hover:text-primary">{s.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <span className="truncate">{className}</span>
                  </p>
                </div>
              </button>
              <div className="mt-3 flex items-center justify-end gap-1 border-t border-border/30 pt-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => startEditSubject(s)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Modifier"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    startTransition(async () => {
                      const result = await deleteSubject({ id: s.id });
                      if (result.error) {
                        setPendingSubjectCascadeId(s.id);
                        return;
                      }
                      refreshSubjects();
                    });
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {pendingSubjectCascadeId === s.id && (
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1">Contenu rattaché — confirmer la suppression de tout ?</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 shrink-0 border-amber-300 px-2 text-[11px] text-amber-800 dark:text-amber-300"
                    onClick={() =>
                      run(() => deleteSubject({ id: s.id, cascade: true }), () => {
                        setPendingSubjectCascadeId(null);
                        refreshSubjects();
                      })
                    }
                  >
                    Confirmer
                  </Button>
                  <button onClick={() => setPendingSubjectCascadeId(null)} className="shrink-0 text-[11px] font-medium hover:underline">
                    Annuler
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
        {filteredSubjects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground/50">
            <BookOpen className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Aucune matière trouvée</p>
          </div>
        )}
      </motion.div>
    </div>
  );

  const Level1 = (
    <div className="space-y-6">
      <LevelHeader
        crumbs={[{ label: 'Académique' }, { label: 'Contenu', onClick: () => goTo(0, 'back') }, { label: selectedSubject?.name ?? '…' }]}
        title={selectedSubject?.name ?? ''}
        subtitle={`${chapters.length} chapitre${chapters.length !== 1 ? 's' : ''}`}
        back={() => goTo(0, 'back')}
        backLabel="Matières"
        actions={
          <Button onClick={startCreateChapter} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau chapitre
          </Button>
        }
      />

      {error && <ErrorBanner msg={error} />}

      {selectedSubject && countryId && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Classes liées (tronc commun — contenu partagé, section 1.5) :
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {subjectClassLinks.map((l) => (
              <span key={l.class_node_id} className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/60 px-2.5 py-0.5 text-xs font-medium">
                {l.className ?? 'Classe supprimée'}
                <button
                  onClick={() =>
                    run(() => removeSubjectClassLink({ subjectId: selectedSubject.id, classNodeId: l.class_node_id }), () => refreshLinks(selectedSubject.id))
                  }
                >
                  <X className="h-3 w-3 text-muted-foreground transition-colors hover:text-rose-600" />
                </button>
              </span>
            ))}
            {subjectClassLinks.length === 0 && (
              <span className="text-xs text-muted-foreground/60">Aucune — matière propre à sa seule classe.</span>
            )}
            <HierarchicalNodeSelect
              nodes={academicNodes ?? []}
              countryId={countryId}
              value=""
              onChange={(id) => {
                if (!id) return;
                run(() => addSubjectClassLink({ subjectId: selectedSubject.id, classNodeId: id }), () => refreshLinks(selectedSubject.id));
              }}
              excludeLeafIds={[selectedSubject.node_id, ...subjectClassLinks.map((l) => l.class_node_id)]}
              compact
            />
          </div>
        </div>
      )}

      <CollapseForm open={showChapterForm}>
        <p className="mb-4 text-sm font-semibold">{editingChapterId ? 'Modifier le chapitre' : 'Créer un chapitre'}</p>
        <div className="space-y-3">
          <div>
            <Label>Titre</Label>
            <Input className="mt-1" placeholder="ex. Les nombres réels" value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} />
          </div>
          <div>
            <Label>Introduction</Label>
            <Textarea
              className="mt-1"
              placeholder="Présentation du chapitre, affichée en tête avant les leçons…"
              rows={3}
              value={newChapterIntroduction}
              onChange={(e) => setNewChapterIntroduction(e.target.value)}
            />
          </div>
          <div>
            <Label>Trimestre</Label>
            <Select items={chapterTermItems} value={newChapterTermId} onValueChange={(v) => setNewChapterTermId(v ?? '')}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionner un trimestre…" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} — {t.school_year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {terms.length === 0 && <p className="mt-1 text-xs text-amber-600">Aucun trimestre disponible — créez-en un d&apos;abord.</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={cancelChapterForm}>
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={isPending || !newChapterTitle || !newChapterTermId}
              onClick={() =>
                editingChapterId
                  ? run(
                      () => updateChapter({ id: editingChapterId, title: newChapterTitle, introduction: newChapterIntroduction, termId: newChapterTermId }),
                      () => {
                        cancelChapterForm();
                        refreshChapters(selectedSubject!.id);
                      }
                    )
                  : run(
                      () => createChapter({ subjectId: selectedSubject!.id, termId: newChapterTermId, title: newChapterTitle, introduction: newChapterIntroduction }),
                      () => {
                        cancelChapterForm();
                        refreshChapters(selectedSubject!.id);
                      }
                    )
              }
            >
              {editingChapterId ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </div>
      </CollapseForm>

      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {chapters.map((ch, idx) => (
          <motion.div key={ch.id} variants={item}>
            <div className="group flex items-center gap-2 rounded-2xl border border-border/40 bg-card p-2 shadow-sm transition-all duration-200 hover:border-primary/25 hover:shadow-lg">
              <div className="flex shrink-0 flex-col">
                <button
                  className="rounded p-0.5 text-muted-foreground/50 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
                  disabled={idx === 0}
                  onClick={() => run(() => moveChapter({ id: ch.id, direction: 'up', subjectId: selectedSubject!.id }), () => refreshChapters(selectedSubject!.id))}
                  title="Monter"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  className="rounded p-0.5 text-muted-foreground/50 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
                  disabled={idx === chapters.length - 1}
                  onClick={() => run(() => moveChapter({ id: ch.id, direction: 'down', subjectId: selectedSubject!.id }), () => refreshChapters(selectedSubject!.id))}
                  title="Descendre"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <button onClick={() => openChapter(ch.id)} className="group flex flex-1 items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-muted/40">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground transition-colors group-hover:text-primary">{ch.title}</p>
                  {ch.term_id && <p className="mt-0.5 text-xs text-muted-foreground">{terms.find((t) => t.id === ch.term_id)?.name ?? 'Trimestre inconnu'}</p>}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/50" />
              </button>
              <button
                onClick={() => startEditChapter(ch)}
                className="shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                title="Modifier"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const result = await deleteChapter({ id: ch.id });
                    if (result.error) {
                      setPendingChapterCascadeId(ch.id);
                      return;
                    }
                    refreshChapters(selectedSubject!.id);
                  });
                }}
                className="shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {pendingChapterCascadeId === ch.id && (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">Contenu rattaché — confirmer la suppression de tout ?</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 shrink-0 border-amber-300 px-2 text-[11px] text-amber-800 dark:text-amber-300"
                  onClick={() =>
                    run(() => deleteChapter({ id: ch.id, cascade: true }), () => {
                      setPendingChapterCascadeId(null);
                      refreshChapters(selectedSubject!.id);
                    })
                  }
                >
                  Confirmer
                </Button>
                <button onClick={() => setPendingChapterCascadeId(null)} className="shrink-0 text-[11px] font-medium hover:underline">
                  Annuler
                </button>
              </div>
            )}
          </motion.div>
        ))}
        {chapters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
            <Layers className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Aucun chapitre — créez-en un</p>
          </div>
        )}
      </motion.div>

      {selectedSubject && (
        <ExerciseManager
          attachment={{ level: 'subject', subjectId: selectedSubject.id }}
          subjectId={selectedSubject.id}
          classNodeId={selectedSubject.node_id}
          heading="Exercices indépendants (mélange de chapitres, type examen)"
          emptyLabel="Aucun exercice indépendant pour cette matière"
        />
      )}
    </div>
  );

  const Level2 = (
    <div className="space-y-6">
      <LevelHeader
        crumbs={[
          { label: 'Académique' },
          { label: 'Contenu', onClick: () => goTo(0, 'back') },
          { label: selectedSubject?.name ?? '…', onClick: () => goTo(1, 'back') },
          { label: selectedChapter?.title ?? '…' },
        ]}
        title={selectedChapter?.title ?? ''}
        subtitle={`${lessons.length} leçon${lessons.length !== 1 ? 's' : ''}`}
        back={() => goTo(1, 'back')}
        backLabel={selectedSubject?.name ?? 'Chapitres'}
        actions={
          <Button onClick={startCreateLesson} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle leçon
          </Button>
        }
      />

      {error && <ErrorBanner msg={error} />}

      {chapterUnlocks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Unlock className="h-3 w-3" />
            Déblocages anticipés :
          </span>
          {chapterUnlocks.map((u) => (
            <span key={u.id} className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/60 px-2.5 py-0.5 text-xs">
              {u.establishmentName ?? 'Tout le pays'}
              <button onClick={() => run(() => deleteChapterUnlock({ id: u.id }), () => refreshUnlocks(selectedChapterId!))}>
                <X className="h-3 w-3 text-muted-foreground transition-colors hover:text-rose-600" />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <Select items={establishmentItems} value={newUnlockEstablishmentId} onValueChange={(v) => setNewUnlockEstablishmentId(v ?? '')}>
              <SelectTrigger className="h-7 w-48 rounded-full border-dashed text-xs">
                <SelectValue placeholder="Débloquer pour…" />
              </SelectTrigger>
              <SelectContent>
                {establishments.map((e) => (
                  <SelectItem key={e.id} value={e.id} className="text-xs">
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {newUnlockEstablishmentId && (
              <Button
                size="sm"
                className="h-7 rounded-full px-3 text-xs"
                onClick={() =>
                  run(() => createChapterUnlock({ chapterId: selectedChapterId!, establishmentId: newUnlockEstablishmentId }), () => {
                    setNewUnlockEstablishmentId('');
                    refreshUnlocks(selectedChapterId!);
                  })
                }
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      <Dialog open={showLessonForm} onOpenChange={(open) => !open && cancelLessonForm()}>
        <DialogContent className="overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>{editingLessonId ? 'Modifier la leçon' : 'Créer une leçon'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Titre</Label>
              <Input className="mt-1" placeholder="ex. Introduction aux limites" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} />
            </div>
            <div>
              <Label>Type pédagogique (catalogue)</Label>
              <Select
                items={Object.fromEntries(catalogEntries.map((c) => [c.id, c.element_type]))}
                value={newLessonCatalogId}
                onValueChange={(v) => setNewLessonCatalogId(v ?? '')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  {catalogEntries.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.element_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contenu</Label>
              <div className="mt-1">
                <RichLessonEditor
                  key={`lesson-${lessonFormInstanceKey}`}
                  content={newLessonContent}
                  onChange={setNewLessonContent}
                  classNodeId={selectedSubject?.node_id ?? ''}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={cancelLessonForm}>
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={isPending || !newLessonTitle}
              onClick={() =>
                editingLessonId
                  ? run(
                      () =>
                        updateLesson({
                          id: editingLessonId,
                          title: newLessonTitle,
                          contentJson: newLessonContent,
                          catalogId: newLessonCatalogId || null,
                        }),
                      () => {
                        cancelLessonForm();
                        refreshLessons(selectedChapterId!);
                      }
                    )
                  : run(
                      () =>
                        createLesson({
                          chapterId: selectedChapterId!,
                          title: newLessonTitle,
                          contentJson: newLessonContent,
                          catalogId: newLessonCatalogId || null,
                        }),
                      () => {
                        cancelLessonForm();
                        refreshLessons(selectedChapterId!);
                      }
                    )
              }
            >
              {editingLessonId ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {lessons.map((lesson, idx) => {
          const status = lesson.latestVersion?.status ?? 'brouillon';
          const canSubmit = status === 'brouillon' || status === 'a_corriger';
          return (
            <motion.div
              key={lesson.id}
              variants={item}
              className="group rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all hover:border-border/70 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex shrink-0 flex-col">
                  <button
                    className="rounded p-0.5 text-muted-foreground/50 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
                    disabled={idx === 0}
                    onClick={() => run(() => moveLesson({ id: lesson.id, direction: 'up', chapterId: selectedChapterId! }), () => refreshLessons(selectedChapterId!))}
                    title="Monter"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="rounded p-0.5 text-muted-foreground/50 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
                    disabled={idx === lessons.length - 1}
                    onClick={() => run(() => moveLesson({ id: lesson.id, direction: 'down', chapterId: selectedChapterId! }), () => refreshLessons(selectedChapterId!))}
                    title="Descendre"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-sm font-bold text-amber-600 dark:text-amber-400">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-foreground">{lesson.title}</p>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', STATUS_BADGE[status])}>
                      {CONTENT_STATUS_LABELS[status] ?? status}
                    </span>
                  </div>
                  {lesson.latestVersion?.created_at && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Mis à jour le {new Date(lesson.latestVersion.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1.5"
                  onClick={() => setExpandedLessonId((cur) => (cur === lesson.id ? null : lesson.id))}
                >
                  <ListChecks className="h-3.5 w-3.5" />
                  Exercices
                </Button>
                <button
                  onClick={() => startEditLesson(lesson)}
                  className="shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                  title="Modifier"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {canSubmit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                    onClick={() => run(() => submitForValidation({ lessonId: lesson.id }), () => refreshLessons(selectedChapterId!))}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Soumettre
                  </Button>
                )}
                <button
                  onClick={() => {
                    setError(null);
                    startTransition(async () => {
                      const result = await deleteLesson({ id: lesson.id });
                      if (result.error) {
                        setPendingLessonCascadeId(lesson.id);
                        return;
                      }
                      refreshLessons(selectedChapterId!);
                    });
                  }}
                  className="shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {pendingLessonCascadeId === lesson.id && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1">Exercices rattachés — confirmer la suppression de tout ?</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 shrink-0 border-amber-300 px-2 text-[11px] text-amber-800 dark:text-amber-300"
                    onClick={() =>
                      run(() => deleteLesson({ id: lesson.id, cascade: true }), () => {
                        setPendingLessonCascadeId(null);
                        refreshLessons(selectedChapterId!);
                      })
                    }
                  >
                    Confirmer
                  </Button>
                  <button onClick={() => setPendingLessonCascadeId(null)} className="shrink-0 text-[11px] font-medium hover:underline">
                    Annuler
                  </button>
                </div>
              )}
              {expandedLessonId === lesson.id && selectedSubject && (
                <div className="mt-4 border-t border-border/40 pt-4">
                  <ExerciseManager
                    attachment={{ level: 'lesson', lessonId: lesson.id }}
                    subjectId={selectedSubject.id}
                    classNodeId={selectedSubject.node_id}
                    heading={`Exercices de « ${lesson.title} »`}
                    emptyLabel="Aucun exercice pour cette leçon"
                  />
                </div>
              )}
            </motion.div>
          );
        })}
        {lessons.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
            <FileText className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Aucune leçon — créez-en une</p>
          </div>
        )}
      </motion.div>

      {selectedChapterId && selectedSubject && (
        <ExerciseManager
          attachment={{ level: 'chapter', chapterId: selectedChapterId }}
          subjectId={selectedSubject.id}
          classNodeId={selectedSubject.node_id}
          heading="Exercices du chapitre (entraînement général, hors leçon précise)"
          emptyLabel="Aucun exercice au niveau du chapitre"
        />
      )}
    </div>
  );

  const levels = [Level0, Level1, Level2];

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={level} variants={slide(dir)} initial="initial" animate="animate" exit="exit">
          {levels[level]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
