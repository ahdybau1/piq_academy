'use client';

import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  GraduationCap,
  Plus,
  ChevronRight,
  Home,
  ArrowLeft,
  Trash2,
  Pencil,
  FileText,
  Upload,
  Loader2,
  Calendar,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import {
  fetchOfficialExams,
  createOfficialExam,
  updateOfficialExam,
  deleteOfficialExam,
  fetchExamPapers,
  createExamPaper,
  updateExamPaper,
  deleteExamPaper,
  uploadExamDocument,
} from '@/lib/official-exams/api-client';
import { fetchAcademicNodes } from '@/lib/academic/api-client';
import { fetchSubjects } from '@/lib/content/api-client';
import type { OfficialExamRow, ExamPaperItem } from '@/lib/official-exams/types';
import type { AcademicNodeRow } from '@/lib/academic/types';
import type { SubjectRow } from '@/lib/content/types';
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

export function ExamsPageView({ initialExams, countryId }: { initialExams: OfficialExamRow[]; countryId: string | null }) {
  const [, startTransition] = useTransition();
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

  const leafNodes = useMemo(() => {
    if (!academicNodes) return [];
    const parentIds = new Set(academicNodes.map((n) => n.parent_id).filter(Boolean));
    const byId = new Map(academicNodes.map((n) => [n.id, n]));
    const pathOf = (id: string): string => {
      const parts: string[] = [];
      let cur = byId.get(id);
      while (cur) {
        parts.unshift(cur.name);
        cur = cur.parent_id ? byId.get(cur.parent_id) : undefined;
      }
      return parts.join(' › ');
    };
    return academicNodes
      .filter((n) => !parentIds.has(n.id))
      .map((n) => ({ id: n.id, path: pathOf(n.id) }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [academicNodes]);

  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  useEffect(() => {
    fetchSubjects(countryId ?? undefined).then(setSubjects).catch((e) => setError(e.message));
  }, [countryId]);

  const [papers, setPapers] = useState<ExamPaperItem[]>([]);
  const selectedExam = exams.find((e) => e.id === selectedExamId) ?? null;
  const subjectsForExam = subjects.filter((s) => s.node_id === selectedExam?.class_node_id);

  const refreshExams = () => fetchOfficialExams(countryId ?? undefined).then(setExams).catch((e) => setError(e.message));
  const refreshPapers = (examId: string) => fetchExamPapers(examId).then(setPapers).catch((e) => setError(e.message));

  useEffect(() => {
    if (!selectedExamId) return;
    refreshPapers(selectedExamId);
  }, [selectedExamId]);

  const run = (fn: () => Promise<{ error?: string }>, cb?: () => void) => {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (r.error) {
        setError(r.error);
        return;
      }
      cb?.();
    });
  };

  // ── Formulaire examen ────────────────────────────────────────────────────
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examName, setExamName] = useState('');
  const [examClassNodeId, setExamClassNodeId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [pendingExamCascadeId, setPendingExamCascadeId] = useState<string | null>(null);

  const startCreateExam = () => {
    setEditingExamId(null);
    setExamName('');
    setExamClassNodeId('');
    setExamDate('');
    setShowExamForm(true);
  };
  const startEditExam = (exam: OfficialExamRow) => {
    setEditingExamId(exam.id);
    setExamName(exam.name);
    setExamClassNodeId(exam.class_node_id);
    setExamDate(exam.exam_date ?? '');
    setShowExamForm(true);
  };
  const cancelExamForm = () => setShowExamForm(false);

  const classNodeItems = Object.fromEntries(leafNodes.map((n) => [n.id, n.path]));

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
            <p className="mt-0.5 text-sm text-muted-foreground">Créez un examen puis rattachez ses épreuves par matière et par année.</p>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExamId ? "Modifier l'examen" : 'Créer un examen officiel'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nom</Label>
              <Input className="mt-1" placeholder="ex. BEPC 2026" value={examName} onChange={(e) => setExamName(e.target.value)} />
            </div>
            <div>
              <Label>Classe</Label>
              <Select items={classNodeItems} value={examClassNodeId} onValueChange={(v) => setExamClassNodeId(v ?? '')}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner une classe…" />
                </SelectTrigger>
                <SelectContent>
                  {leafNodes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date clé (alimente le countdown élève)</Label>
              <Input className="mt-1" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={cancelExamForm}>
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={!examName || !examClassNodeId}
              onClick={() =>
                editingExamId
                  ? run(
                      () => updateOfficialExam({ id: editingExamId, classNodeId: examClassNodeId, name: examName, examDate: examDate || null }),
                      () => {
                        cancelExamForm();
                        refreshExams();
                      }
                    )
                  : run(
                      () =>
                        createOfficialExam({
                          countryId: countryId!,
                          classNodeId: examClassNodeId,
                          name: examName,
                          examDate: examDate || null,
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
        {exams.map((exam) => {
          const className = leafNodes.find((n) => n.id === exam.class_node_id)?.path ?? 'Classe supprimée';
          return (
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
                  <p className="mt-0.5 text-xs text-muted-foreground">{className}</p>
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
          );
        })}
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
              <p className="mt-0.5 text-sm text-muted-foreground">Épreuves par matière et par année</p>
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

      {subjectsForExam.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          Aucune matière n&apos;est encore rattachée à cette classe — créez-en une dans Matières &amp; Contenu avant d&apos;ajouter une épreuve.
        </div>
      )}

      <Dialog open={showPaperForm} onOpenChange={(open) => !open && cancelPaperForm()}>
        <DialogContent className="max-w-lg">
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
              disabled={!paperSubjectId || !paperYear}
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
            className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:border-border/70 hover:shadow-md"
          >
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
