'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Plus, ChevronRight, Hop as Home, ArrowLeft, Trash2, Pencil, FileText, Upload, Loader as Loader2, Calendar, TriangleAlert as AlertTriangle, Globe, X, Share2 } from 'lucide-react';
import {
  fetchOfficialExams,
  createOfficialExam,
  updateOfficialExam,
  deleteOfficialExam,
  fetchExamTypeClasses,
  addExamTypeClass,
  removeExamTypeClass,
  fetchSubjectsForExamType,
  fetchExamPapers,
  createExamPaper,
  updateExamPaper,
  deleteExamPaper,
  fetchExamPaperSharedExams,
  addExamPaperSharedExam,
  removeExamPaperSharedExam,
  uploadExamDocument,
} from '@/lib/official-exams/api-client';
import { fetchAcademicNodes } from '@/lib/academic/api-client';
import { HierarchicalNodeSelect } from './hierarchical-node-select';
import type { OfficialExamRow, ExamPaperItem, ExamTypeClassItem, ExamPaperSharedExamItem } from '@/lib/official-exams/types';
import type { AcademicNodeRow } from '@/lib/academic/types';
import { cn } from '@/lib/utils';

type Dir = 'forward' | 'back';

function slide(dir: Dir): Variants {
  return {
    initial: { x: dir === 'forward' ? 64 : -64, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { x: dir === 'forward' ? -64 : 64, opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] } },
  };
}

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } } };
const rowItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
      {msg}
    </div>
  );
}

/** Bouton d'upload compact : affiche l'état actuel (aucun / téléversé) et remplace via un input file caché. */
function DocumentUploadField({
  label,
  url,
  onUploaded,
}: {
  label: string;
  url: string | null;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const { url: uploadedUrl } = await uploadExamDocument(file);
      onUploaded(uploadedUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {url ? 'Remplacer' : 'Téléverser un PDF'}
        </Button>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
            <FileText className="h-3.5 w-3.5" />
            Voir le fichier actuel
          </a>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

/** Chips + sélecteur cascadant pour gérer les classes/séries habilitées à composer un examen (section 3). */
function ExamClassesManager({
  examTypeId,
  classes,
  academicNodes,
  countryId,
  onChanged,
  onError,
}: {
  examTypeId: string;
  classes: ExamTypeClassItem[];
  academicNodes: AcademicNodeRow[];
  countryId: string;
  onChanged: () => void;
  onError: (msg: string) => void;
}) {
  const [, startTransition] = useTransition();
  const isRunningRef = useRef(false);

  const run = (fn: () => Promise<{ error?: string }>) => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    onError('');
    startTransition(async () => {
      try {
        const r = await fn();
        if (r.error) {
          onError(r.error);
          return;
        }
        onChanged();
      } finally {
        isRunningRef.current = false;
      }
    });
  };

  return (
    <div className="space-y-2 rounded-2xl border border-border/40 bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">Classes/séries habilitées à composer cet examen :</p>
      <div className="flex flex-wrap items-center gap-2">
        {classes.map((c) => (
          <span key={c.id} className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/60 px-2.5 py-0.5 text-xs font-medium">
            {c.className ?? 'Classe supprimée'}
            <button
              onClick={() => run(() => removeExamTypeClass({ examTypeId, classNodeId: c.class_node_id }))}
            >
              <X className="h-3 w-3 text-muted-foreground transition-colors hover:text-rose-600" />
            </button>
          </span>
        ))}
        {classes.length === 0 && (
          <span className="text-xs text-amber-700 dark:text-amber-400">
            Aucune — cet examen n&apos;apparaîtra dans aucun sélecteur tant qu&apos;aucune classe n&apos;est ajoutée.
          </span>
        )}
        <HierarchicalNodeSelect
          nodes={academicNodes}
          countryId={countryId}
          value=""
          onChange={(id) => {
            if (!id) return;
            run(() => addExamTypeClass({ examTypeId, classNodeId: id }));
          }}
          excludeLeafIds={classes.map((c) => c.class_node_id)}
          compact
        />
      </div>
    </div>
  );
}

export function ExamsPageView({ initialExams, countryId }: { initialExams: OfficialExamRow[]; countryId: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [exams, setExams] = useState(initialExams);
  const [error, setError] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [dir, setDir] = useState<Dir>('forward');

  const [prevInitialExams, setPrevInitialExams] = useState(initialExams);
  if (initialExams !== prevInitialExams) {
    setPrevInitialExams(initialExams);
    setExams(initialExams);
  }

  const [academicNodes, setAcademicNodes] = useState<AcademicNodeRow[] | null>(null);
  useEffect(() => {
    fetchAcademicNodes(countryId ?? undefined).then(setAcademicNodes).catch((e) => setError(e.message));
  }, [countryId]);

  const [papers, setPapers] = useState<ExamPaperItem[]>([]);
  const selectedExam = exams.find((e) => e.id === selectedExamId) ?? null;

  // Classes/séries habilitées à composer l'examen sélectionné (section 3) — remplace l'ancien
  // class_node_id unique : un examen n'apparaît dans les sélecteurs élève/admin que pour les
  // classes explicitement déclarées ici (ex. aucune classe de 6e n'est jamais ajoutée à un
  // examen, donc 6e ne compose jamais rien — la règle est portée par la donnée, pas codée en dur).
  const [examClasses, setExamClasses] = useState<ExamTypeClassItem[]>([]);
  const refreshExamClasses = (examTypeId: string) => fetchExamTypeClasses(examTypeId).then(setExamClasses).catch((e) => setError(e.message));

  // Matières applicables à l'examen : union des matières (tronc commun inclus) de toutes ses
  // classes habilitées.
  const [subjectsForExam, setSubjectsForExam] = useState<{ id: string; name: string }[]>([]);
  const [prevSelectedExamId, setPrevSelectedExamId] = useState<string | null>(selectedExam?.id ?? null);
  if ((selectedExam?.id ?? null) !== prevSelectedExamId) {
    setPrevSelectedExamId(selectedExam?.id ?? null);
    if (!selectedExam) {
      setSubjectsForExam([]);
      setExamClasses([]);
    }
  }
  const refreshSubjectsForExam = (examTypeId: string) => fetchSubjectsForExamType(examTypeId).then(setSubjectsForExam).catch((e) => setError(e.message));
  useEffect(() => {
    if (!selectedExam) return;
    refreshExamClasses(selectedExam.id);
    refreshSubjectsForExam(selectedExam.id);
  }, [selectedExam]);

  const refreshExams = () => fetchOfficialExams(countryId ?? undefined).then(setExams).catch((e) => setError(e.message));
  const refreshPapers = (examId: string) => fetchExamPapers(examId).then(setPapers).catch((e) => setError(e.message));

  useEffect(() => {
    if (!selectedExamId) return;
    refreshPapers(selectedExamId);
  }, [selectedExamId]);

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

  // ── Formulaire examen ────────────────────────────────────────────────────
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [newExamClassNodeIds, setNewExamClassNodeIds] = useState<string[]>([]);
  const [pendingExamCascadeId, setPendingExamCascadeId] = useState<string | null>(null);

  const startCreateExam = () => {
    setEditingExamId(null);
    setExamName('');
    setExamDate('');
    setNewExamClassNodeIds([]);
    setShowExamForm(true);
  };
  const startEditExam = (exam: OfficialExamRow) => {
    setEditingExamId(exam.id);
    setExamName(exam.name);
    setExamDate(exam.exam_date ?? '');
    setShowExamForm(true);
  };
  const cancelExamForm = () => setShowExamForm(false);

  const openExam = (id: string) => {
    setDir('forward');
    setSelectedExamId(id);
    setPapers([]);
    cancelPaperForm();
  };
  const closeExam = () => {
    setDir('back');
    setSelectedExamId(null);
  };

  // ── Formulaire épreuve ───────────────────────────────────────────────────
  const [showPaperForm, setShowPaperForm] = useState(false);
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [paperSubjectId, setPaperSubjectId] = useState('');
  const [paperYear, setPaperYear] = useState(new Date().getFullYear().toString());
  const [paperDocumentUrl, setPaperDocumentUrl] = useState<string | null>(null);
  const [paperCorrectionUrl, setPaperCorrectionUrl] = useState<string | null>(null);
  const [paperCorrectionVisible, setPaperCorrectionVisible] = useState(false);

  const startCreatePaper = () => {
    setEditingPaperId(null);
    setPaperSubjectId('');
    setPaperYear(new Date().getFullYear().toString());
    setPaperDocumentUrl(null);
    setPaperCorrectionUrl(null);
    setPaperCorrectionVisible(false);
    setShowPaperForm(true);
  };
  const startEditPaper = (paper: ExamPaperItem) => {
    setEditingPaperId(paper.id);
    setPaperSubjectId(paper.subject_id);
    setPaperYear(paper.year.toString());
    setPaperDocumentUrl(paper.document_url);
    setPaperCorrectionUrl(paper.correction_url);
    setPaperCorrectionVisible(paper.correction_visible);
    setShowPaperForm(true);
  };
  const cancelPaperForm = () => setShowPaperForm(false);

  const paperSubjectItems = Object.fromEntries(subjectsForExam.map((s) => [s.id, s.name]));

  // ── Partage d'épreuve entre examens (ex. Philosophie commune à Probatoire C et D) ───────
  const [expandedSharePaperId, setExpandedSharePaperId] = useState<string | null>(null);
  const [sharedByPaper, setSharedByPaper] = useState<Record<string, ExamPaperSharedExamItem[]>>({});
  const [addShareExamId, setAddShareExamId] = useState('');

  const refreshSharedForPaper = (paperId: string) =>
    fetchExamPaperSharedExams(paperId)
      .then((links) => setSharedByPaper((prev) => ({ ...prev, [paperId]: links })))
      .catch((e) => setError(e.message));

  const toggleSharePanel = (paperId: string) => {
    if (expandedSharePaperId === paperId) {
      setExpandedSharePaperId(null);
      return;
    }
    setExpandedSharePaperId(paperId);
    setAddShareExamId('');
    if (!sharedByPaper[paperId]) refreshSharedForPaper(paperId);
  };

  const otherExamItems = Object.fromEntries(
    exams.filter((e) => e.id !== selectedExam?.id).map((e) => [e.id, e.name])
  );

  // ── Niveau 0 : liste des examens ─────────────────────────────────────────
  const ListLevel = (
    <div className="space-y-6">
      <div className="space-y-3 pb-2">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span>Académique</span>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80">Examens officiels</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Examens officiels nationaux</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Créez un examen, déclarez ses classes/séries habilitées, puis rattachez ses épreuves par matière et par année.
            </p>
          </div>
          {countryId && (
            <Button size="sm" className="gap-2" onClick={startCreateExam}>
              <Plus className="h-4 w-4" />
              Nouvel examen
            </Button>
          )}
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      {error && <ErrorBanner msg={error} />}

      {!countryId && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <Globe className="h-5 w-5 shrink-0" />
          Sélectionnez un pays via le menu « Périmètre » en haut de page pour créer un examen officiel.
        </div>
      )}

      <Dialog open={showExamForm} onOpenChange={(open) => !open && cancelExamForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExamId ? "Modifier l'examen" : 'Créer un examen officiel'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nom</Label>
              <Input className="mt-1" placeholder="ex. Probatoire C" value={examName} onChange={(e) => setExamName(e.target.value)} />
            </div>
            <div>
              <Label>Date clé (alimente le countdown élève)</Label>
              <Input className="mt-1" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            </div>
            {!editingExamId && countryId && (
              <div className="space-y-2">
                <Label>Classes/séries habilitées</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {newExamClassNodeIds.map((id) => {
                    const node = (academicNodes ?? []).find((n) => n.id === id);
                    return (
                      <span key={id} className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/60 px-2.5 py-0.5 text-xs font-medium">
                        {node?.name ?? id}
                        <button onClick={() => setNewExamClassNodeIds((prev) => prev.filter((x) => x !== id))}>
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
                      if (!id || newExamClassNodeIds.includes(id)) return;
                      setNewExamClassNodeIds((prev) => [...prev, id]);
                    }}
                    excludeLeafIds={newExamClassNodeIds}
                    compact
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Optionnel ici — ajoutables/modifiables à tout moment depuis la fiche de l&apos;examen.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={cancelExamForm}>
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={isPending || !examName}
              onClick={() =>
                editingExamId
                  ? run(
                      () => updateOfficialExam({ id: editingExamId, name: examName, examDate: examDate || null }),
                      () => {
                        cancelExamForm();
                        refreshExams();
                      }
                    )
                  : run(
                      () =>
                        createOfficialExam({
                          countryId: countryId!,
                          name: examName,
                          examDate: examDate || null,
                          initialClassNodeIds: newExamClassNodeIds,
                        }),
                      () => {
                        cancelExamForm();
                        refreshExams();
                      }
                    )
              }
            >
              {editingExamId ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="show">
        {exams.map((exam) => (
          <motion.div
            key={exam.id}
            variants={rowItem}
            className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
          >
            <button onClick={() => openExam(exam.id)} className="flex items-start gap-3 text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground transition-colors group-hover:text-primary">{exam.name}</p>
                {exam.exam_date && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(exam.exam_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            </button>
            <div className="flex items-center justify-end gap-1 border-t border-border/30 pt-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => startEditExam(exam)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Modifier"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    const result = await deleteOfficialExam({ id: exam.id });
                    if (result.error) {
                      setPendingExamCascadeId(exam.id);
                      return;
                    }
                    refreshExams();
                  })
                }
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {pendingExamCascadeId === exam.id && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">Épreuves rattachées — confirmer la suppression de tout ?</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 shrink-0 border-amber-300 px-2 text-[11px] text-amber-800 dark:text-amber-300"
                  onClick={() =>
                    run(() => deleteOfficialExam({ id: exam.id, cascade: true }), () => {
                      setPendingExamCascadeId(null);
                      refreshExams();
                    })
                  }
                >
                  Confirmer
                </Button>
                <button onClick={() => setPendingExamCascadeId(null)} className="shrink-0 text-[11px] font-medium hover:underline">
                  Annuler
                </button>
              </div>
            )}
          </motion.div>
        ))}
        {exams.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground/50">
            <GraduationCap className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Aucun examen officiel — créez-en un</p>
          </div>
        )}
      </motion.div>
    </div>
  );

  // ── Niveau 1 : épreuves d'un examen ──────────────────────────────────────
  const DetailLevel = selectedExam && (
    <div className="space-y-6">
      <div className="space-y-3">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <button className="transition-colors hover:text-foreground" onClick={closeExam}>
            Examens officiels
          </button>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80">{selectedExam.name}</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={closeExam}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{selectedExam.name}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Classes habilitées, puis épreuves par matière et par année</p>
            </div>
          </div>
          <Button size="sm" className="gap-2" onClick={startCreatePaper} disabled={subjectsForExam.length === 0}>
            <Plus className="h-4 w-4" />
            Nouvelle épreuve
          </Button>
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      {error && <ErrorBanner msg={error} />}

      {countryId && (
        <ExamClassesManager
          examTypeId={selectedExam.id}
          classes={examClasses}
          academicNodes={academicNodes ?? []}
          countryId={countryId}
          onChanged={() => {
            refreshExamClasses(selectedExam.id);
            refreshSubjectsForExam(selectedExam.id);
          }}
          onError={setError}
        />
      )}

      {examClasses.length > 0 && subjectsForExam.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          Aucune matière n&apos;est encore rattachée à ces classes — créez-en une dans Matières &amp; Contenu avant d&apos;ajouter une épreuve.
        </div>
      )}

      <Dialog open={showPaperForm} onOpenChange={(open) => !open && cancelPaperForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPaperId ? "Modifier l'épreuve" : 'Créer une épreuve'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Matière</Label>
                <Select items={paperSubjectItems} value={paperSubjectId} onValueChange={(v) => setPaperSubjectId(v ?? '')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner…" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectsForExam.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Année</Label>
                <Input className="mt-1" type="number" value={paperYear} onChange={(e) => setPaperYear(e.target.value)} />
              </div>
            </div>
            <DocumentUploadField label="Sujet (PDF)" url={paperDocumentUrl} onUploaded={setPaperDocumentUrl} />
            <DocumentUploadField label="Correction (PDF, optionnelle)" url={paperCorrectionUrl} onUploaded={setPaperCorrectionUrl} />
            <div className="flex items-center justify-between rounded-xl border border-border/40 px-3 py-2.5">
              <Label className="font-normal">Correction visible des élèves</Label>
              <Switch checked={paperCorrectionVisible} onCheckedChange={setPaperCorrectionVisible} disabled={!paperCorrectionUrl} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={cancelPaperForm}>
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={isPending || !paperSubjectId || !paperYear}
              onClick={() => {
                const payload = {
                  subjectId: paperSubjectId,
                  year: Number(paperYear),
                  documentUrl: paperDocumentUrl,
                  correctionUrl: paperCorrectionUrl,
                  correctionVisible: paperCorrectionVisible && !!paperCorrectionUrl,
                };
                if (editingPaperId) {
                  run(() => updateExamPaper({ id: editingPaperId, ...payload }), () => {
                    cancelPaperForm();
                    refreshPapers(selectedExam.id);
                  });
                } else {
                  run(() => createExamPaper({ examId: selectedExam.id, ...payload }), () => {
                    cancelPaperForm();
                    refreshPapers(selectedExam.id);
                  });
                }
              }}
            >
              {editingPaperId ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {papers.map((paper) => (
          <motion.div
            key={paper.id}
            variants={rowItem}
            className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:border-border/70 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-sm font-bold text-amber-600 dark:text-amber-400">
                {paper.year}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{paper.subjectName ?? 'Matière supprimée'}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className={cn('rounded-full px-2 py-0.5 font-medium', paper.document_url ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-muted')}>
                    {paper.document_url ? 'Sujet en ligne' : 'Sujet manquant'}
                  </span>
                  <span className={cn('rounded-full px-2 py-0.5 font-medium', paper.correction_url ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-muted')}>
                    {paper.correction_url ? 'Correction en ligne' : 'Aucune correction'}
                  </span>
                  {paper.correction_url && (
                    <span className={cn('rounded-full px-2 py-0.5 font-medium', paper.correction_visible ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300')}>
                      {paper.correction_visible ? 'Correction visible' : 'Correction masquée'}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleSharePanel(paper.id)}
                className={cn(
                  'shrink-0 rounded-lg p-2 text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground',
                  expandedSharePaperId === paper.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}
                title="Partager avec un autre examen"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => startEditPaper(paper)}
                className="shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                title="Modifier"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => run(() => deleteExamPaper({ id: paper.id }), () => refreshPapers(selectedExam.id))}
                className="shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {expandedSharePaperId === paper.id && (
              <div className="space-y-2 rounded-xl border border-border/40 bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Cette épreuve est aussi utilisée par (ex. Philosophie commune à Probatoire C et D) :
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {(sharedByPaper[paper.id] ?? []).map((s) => (
                    <span key={s.id} className="flex items-center gap-1 rounded-full border border-border/50 bg-background px-2.5 py-0.5 text-xs font-medium">
                      {s.examName ?? 'Examen supprimé'}
                      <button
                        onClick={() =>
                          run(() => removeExamPaperSharedExam({ examPaperId: paper.id, examTypeId: s.exam_type_id }), () => refreshSharedForPaper(paper.id))
                        }
                      >
                        <X className="h-3 w-3 text-muted-foreground transition-colors hover:text-rose-600" />
                      </button>
                    </span>
                  ))}
                  {(sharedByPaper[paper.id] ?? []).length === 0 && (
                    <span className="text-xs text-muted-foreground/60">Aucun partage — propre à {selectedExam.name}.</span>
                  )}
                  {Object.keys(otherExamItems).length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Select items={otherExamItems} value={addShareExamId} onValueChange={(v) => setAddShareExamId(v ?? '')}>
                        <SelectTrigger className="h-7 w-40 text-xs">
                          <SelectValue placeholder="Ajouter un examen…" />
                        </SelectTrigger>
                        <SelectContent>
                          {exams
                            .filter((e) => e.id !== selectedExam.id && !(sharedByPaper[paper.id] ?? []).some((s) => s.exam_type_id === e.id))
                            .map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        disabled={isPending || !addShareExamId}
                        onClick={() =>
                          run(() => addExamPaperSharedExam({ examPaperId: paper.id, examTypeId: addShareExamId }), () => {
                            setAddShareExamId('');
                            refreshSharedForPaper(paper.id);
                          })
                        }
                      >
                        Ajouter
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
        {papers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
            <FileText className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Aucune épreuve — cet examen n&apos;est pas encore exploitable</p>
          </div>
        )}
      </motion.div>
    </div>
  );

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={selectedExam ? 'detail' : 'list'} variants={slide(dir)} initial="initial" animate="animate" exit="exit">
          {selectedExam ? DetailLevel : ListLevel}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
