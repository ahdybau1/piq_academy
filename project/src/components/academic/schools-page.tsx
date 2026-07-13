'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building2,
  Plus,
  Search,
  ChevronRight,
  Home,
  ArrowLeft,
  MapPin,
  FileText,
  Globe,
  Trash2,
  Pencil,
  Send,
  Upload,
  Loader2,
  AlertTriangle,
  Users,
} from 'lucide-react';
import {
  fetchEstablishments,
  createEstablishment,
  updateEstablishment,
  fetchEstablishmentPapers,
  createEstablishmentPaper,
  updateEstablishmentPaper,
  deleteEstablishmentPaper,
  submitEstablishmentPaperForValidation,
  uploadEstablishmentDocument,
  fetchEstablishmentTeachers,
} from '@/lib/establishments/api-client';
import { fetchAcademicNodes } from '@/lib/academic/api-client';
import { useWorkingClass } from '@/lib/working-class-context';
import { fetchSubjectsForClass } from '@/lib/content/api-client';
import { CONTENT_STATUS_LABELS } from '@/lib/content/constants';
import { HierarchicalNodeSelect } from './hierarchical-node-select';
import type { EstablishmentRow, EstablishmentPaperItem, EstablishmentTeacherItem } from '@/lib/establishments/types';
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

const STATUS_BADGE: Record<string, string> = {
  brouillon: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  en_attente_de_validation: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  a_corriger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  rejete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  publie: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
      {msg}
    </div>
  );
}

function DocumentUploadField({ label, url, onUploaded }: { label: string; url: string | null; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const { url: uploadedUrl } = await uploadEstablishmentDocument(file);
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

export function SchoolsPageView({ initialEstablishments, countryId }: { initialEstablishments: EstablishmentRow[]; countryId: string | null }) {
  const [isPending, startTransition] = useTransition();
  const { workingClassNodeId } = useWorkingClass();
  const [establishments, setEstablishments] = useState(initialEstablishments);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dir, setDir] = useState<Dir>('forward');
  const [search, setSearch] = useState('');

  const [prevInitial, setPrevInitial] = useState(initialEstablishments);
  if (initialEstablishments !== prevInitial) {
    setPrevInitial(initialEstablishments);
    setEstablishments(initialEstablishments);
  }

  const [academicNodes, setAcademicNodes] = useState<AcademicNodeRow[] | null>(null);
  useEffect(() => {
    fetchAcademicNodes(countryId ?? undefined).then(setAcademicNodes).catch((e) => setError(e.message));
  }, [countryId]);

  const [papers, setPapers] = useState<EstablishmentPaperItem[]>([]);
  const [teachers, setTeachers] = useState<EstablishmentTeacherItem[]>([]);
  const selected = establishments.find((e) => e.id === selectedId) ?? null;

  const refreshEstablishments = () => fetchEstablishments(countryId ?? undefined).then(setEstablishments).catch((e) => setError(e.message));
  const refreshPapers = (id: string) => fetchEstablishmentPapers(id).then(setPapers).catch((e) => setError(e.message));
  const refreshTeachers = (id: string) => fetchEstablishmentTeachers(id).then(setTeachers).catch((e) => setError(e.message));

  useEffect(() => {
    if (!selectedId) return;
    refreshPapers(selectedId);
    refreshTeachers(selectedId);
  }, [selectedId]);

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

  // ── Formulaire établissement ─────────────────────────────────────────────
  const [showEstablishmentForm, setShowEstablishmentForm] = useState(false);
  const [editingEstablishmentId, setEditingEstablishmentId] = useState<string | null>(null);
  const [establishmentName, setEstablishmentName] = useState('');
  const [establishmentCity, setEstablishmentCity] = useState('');
  const [establishmentActive, setEstablishmentActive] = useState(true);

  const startCreateEstablishment = () => {
    setEditingEstablishmentId(null);
    setEstablishmentName('');
    setEstablishmentCity('');
    setEstablishmentActive(true);
    setShowEstablishmentForm(true);
  };
  const startEditEstablishment = (e: EstablishmentRow) => {
    setEditingEstablishmentId(e.id);
    setEstablishmentName(e.name);
    setEstablishmentCity(e.city ?? '');
    setEstablishmentActive(e.is_active);
    setShowEstablishmentForm(true);
  };
  const cancelEstablishmentForm = () => setShowEstablishmentForm(false);

  const openEstablishment = (id: string) => {
    setDir('forward');
    setSelectedId(id);
    setPapers([]);
    setTeachers([]);
    cancelPaperForm();
  };
  const closeEstablishment = () => {
    setDir('back');
    setSelectedId(null);
  };

  // ── Formulaire épreuve ───────────────────────────────────────────────────
  const [showPaperForm, setShowPaperForm] = useState(false);
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [paperClassNodeId, setPaperClassNodeId] = useState('');
  const [paperSubjectId, setPaperSubjectId] = useState('');
  const [paperYear, setPaperYear] = useState(new Date().getFullYear().toString());
  const [paperDocumentUrl, setPaperDocumentUrl] = useState<string | null>(null);
  const [paperCorrectionUrl, setPaperCorrectionUrl] = useState<string | null>(null);

  const startCreatePaper = () => {
    setEditingPaperId(null);
    setPaperClassNodeId(workingClassNodeId ?? '');
    setPaperSubjectId('');
    setPaperYear(new Date().getFullYear().toString());
    setPaperDocumentUrl(null);
    setPaperCorrectionUrl(null);
    setShowPaperForm(true);
  };
  const startEditPaper = (paper: EstablishmentPaperItem) => {
    setEditingPaperId(paper.id);
    setPaperClassNodeId(paper.class_node_id);
    setPaperSubjectId(paper.subject_id);
    setPaperYear(paper.year.toString());
    setPaperDocumentUrl(paper.document_url);
    setPaperCorrectionUrl(paper.correction_url);
    setShowPaperForm(true);
  };
  const cancelPaperForm = () => setShowPaperForm(false);

  // Matières applicables à la classe choisie, tronc commun inclus (section 1.5).
  const [paperSubjectsForClass, setPaperSubjectsForClass] = useState<SubjectRow[]>([]);
  const [prevPaperClassNodeId, setPrevPaperClassNodeId] = useState(paperClassNodeId);
  if (paperClassNodeId !== prevPaperClassNodeId) {
    setPrevPaperClassNodeId(paperClassNodeId);
    if (!paperClassNodeId) setPaperSubjectsForClass([]);
  }
  useEffect(() => {
    if (!paperClassNodeId) return;
    fetchSubjectsForClass(paperClassNodeId).then(setPaperSubjectsForClass).catch((e) => setError(e.message));
  }, [paperClassNodeId]);

  const filteredEstablishments = search
    ? establishments.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || (e.city ?? '').toLowerCase().includes(search.toLowerCase()))
    : establishments;

  // ── Niveau 0 : liste des établissements ──────────────────────────────────
  const ListLevel = (
    <div className="space-y-6">
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
            <h1 className="text-2xl font-bold tracking-tight">Établissements &amp; Épreuves</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Un établissement sans épreuve rattachée n&apos;a aucune valeur — ajoutez-en une dès la création.
            </p>
          </div>
          {countryId && (
            <Button size="sm" className="gap-2" onClick={startCreateEstablishment}>
              <Plus className="h-4 w-4" />
              Nouvel établissement
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
          Sélectionnez un pays via le menu « Périmètre » en haut de page pour créer un établissement.
        </div>
      )}

      <Dialog open={showEstablishmentForm} onOpenChange={(open) => !open && cancelEstablishmentForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEstablishmentId ? "Modifier l'établissement" : 'Créer un établissement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nom</Label>
              <Input className="mt-1" placeholder="ex. Lycée Général de Douala" value={establishmentName} onChange={(e) => setEstablishmentName(e.target.value)} />
            </div>
            <div>
              <Label>Ville / région</Label>
              <Input className="mt-1" placeholder="ex. Douala" value={establishmentCity} onChange={(e) => setEstablishmentCity(e.target.value)} />
            </div>
            {editingEstablishmentId && (
              <div className="flex items-center justify-between rounded-xl border border-border/40 px-3 py-2.5">
                <Label className="font-normal">Actif</Label>
                <Switch checked={establishmentActive} onCheckedChange={setEstablishmentActive} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={cancelEstablishmentForm}>
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={isPending || !establishmentName}
              onClick={() =>
                editingEstablishmentId
                  ? run(
                      () =>
                        updateEstablishment({
                          id: editingEstablishmentId,
                          name: establishmentName,
                          city: establishmentCity || null,
                          isActive: establishmentActive,
                        }),
                      () => {
                        cancelEstablishmentForm();
                        refreshEstablishments();
                      }
                    )
                  : run(
                      () => createEstablishment({ countryId: countryId!, name: establishmentName, city: establishmentCity || null }),
                      () => {
                        cancelEstablishmentForm();
                        refreshEstablishments();
                      }
                    )
              }
            >
              {editingEstablishmentId ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input className="pl-9" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {filteredEstablishments.map((est) => (
          <motion.div
            key={est.id}
            variants={rowItem}
            className="group flex items-center gap-2 rounded-2xl border border-border/40 bg-card p-2 shadow-sm transition-all hover:border-primary/20 hover:shadow-lg"
          >
            <button onClick={() => openEstablishment(est.id)} className="group flex flex-1 items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-muted/40">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground transition-colors group-hover:text-primary">{est.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {est.city ?? 'Ville non renseignée'}
                </p>
              </div>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                  est.is_active
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                )}
              >
                {est.is_active ? 'Actif' : 'Inactif'}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/50" />
            </button>
            <button
              onClick={() => startEditEstablishment(est)}
              className="shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
              title="Modifier"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
        {filteredEstablishments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
            <Building2 className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Aucun établissement — créez-en un</p>
          </div>
        )}
      </motion.div>
    </div>
  );

  // ── Niveau 1 : détail établissement ──────────────────────────────────────
  const DetailLevel = selected && (
    <div className="space-y-6">
      <div className="space-y-3">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <button className="transition-colors hover:text-foreground" onClick={closeEstablishment}>
            Établissements
          </button>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="max-w-[200px] truncate font-medium text-foreground/80">{selected.name}</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={closeEstablishment}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{selected.name}</h1>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {selected.city ?? 'Ville non renseignée'}
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-2" onClick={startCreatePaper}>
            <Plus className="h-4 w-4" />
            Nouvelle épreuve
          </Button>
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      {error && <ErrorBanner msg={error} />}

      {papers.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="flex-1">
            Cet établissement n&apos;a encore aucune épreuve rattachée — il n&apos;est donc pas exploitable côté élève. Ajoutez-en une
            maintenant.
          </span>
          <Button size="sm" variant="outline" className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100 dark:text-amber-300" onClick={startCreatePaper}>
            Ajouter une épreuve
          </Button>
        </div>
      )}

      <Dialog open={showPaperForm} onOpenChange={(open) => !open && cancelPaperForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPaperId ? "Modifier l'épreuve" : 'Créer une épreuve'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {countryId && (
              <HierarchicalNodeSelect
                nodes={academicNodes ?? []}
                countryId={countryId}
                value={paperClassNodeId}
                onChange={(id) => {
                  setPaperClassNodeId(id);
                  setPaperSubjectId('');
                }}
              />
            )}
            <div>
              <Label>Année</Label>
              <Input className="mt-1" type="number" value={paperYear} onChange={(e) => setPaperYear(e.target.value)} />
            </div>
            <div>
              <Label>Matière</Label>
              <Select
                items={Object.fromEntries(paperSubjectsForClass.map((s) => [s.id, s.name]))}
                value={paperSubjectId}
                onValueChange={(v) => setPaperSubjectId(v ?? '')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={paperClassNodeId ? 'Sélectionner…' : "Choisissez d'abord une classe"} />
                </SelectTrigger>
                <SelectContent>
                  {paperSubjectsForClass.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DocumentUploadField label="Sujet (PDF)" url={paperDocumentUrl} onUploaded={setPaperDocumentUrl} />
            <DocumentUploadField label="Correction (PDF, optionnelle)" url={paperCorrectionUrl} onUploaded={setPaperCorrectionUrl} />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={cancelPaperForm}>
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={isPending || !paperClassNodeId || !paperSubjectId || !paperYear}
              onClick={() => {
                const payload = {
                  classNodeId: paperClassNodeId,
                  subjectId: paperSubjectId,
                  year: Number(paperYear),
                  documentUrl: paperDocumentUrl,
                  correctionUrl: paperCorrectionUrl,
                };
                if (editingPaperId) {
                  run(() => updateEstablishmentPaper({ id: editingPaperId, ...payload }), () => {
                    cancelPaperForm();
                    refreshPapers(selected.id);
                  });
                } else {
                  run(() => createEstablishmentPaper({ establishmentId: selected.id, ...payload }), () => {
                    cancelPaperForm();
                    refreshPapers(selected.id);
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
        {papers.map((paper) => {
          const canSubmit = paper.status === 'brouillon' || paper.status === 'a_corriger';
          return (
            <motion.div
              key={paper.id}
              variants={rowItem}
              className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:border-border/70 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-sm font-bold text-amber-600 dark:text-amber-400">
                {paper.year}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{paper.subjectName ?? 'Matière supprimée'}</p>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', STATUS_BADGE[paper.status])}>
                    {CONTENT_STATUS_LABELS[paper.status] ?? paper.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{paper.className ?? 'Classe supprimée'}</p>
              </div>
              <button
                onClick={() => startEditPaper(paper)}
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
                  onClick={() => run(() => submitEstablishmentPaperForValidation({ paperId: paper.id }), () => refreshPapers(selected.id))}
                >
                  <Send className="h-3.5 w-3.5" />
                  Soumettre
                </Button>
              )}
              <button
                onClick={() => run(() => deleteEstablishmentPaper({ id: paper.id }), () => refreshPapers(selected.id))}
                className="shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      <div>
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          <Users className="h-3.5 w-3.5" />
          Enseignants rattachés ({teachers.length})
        </p>
        {teachers.length === 0 ? (
          <p className="text-sm text-muted-foreground/60">Aucun enseignant rattaché à cet établissement.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {teachers.map((t) => (
              <span key={t.teacherId} className="rounded-full border border-border/50 bg-muted/60 px-3 py-1 text-xs font-medium">
                {t.email}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={selected ? 'detail' : 'list'} variants={slide(dir)} initial="initial" animate="animate" exit="exit">
          {selected ? DetailLevel : ListLevel}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
