'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, FileText, Layers, Send, Plus, X, Unlock } from 'lucide-react';
import {
  fetchSubjects,
  createSubject,
  fetchSubjectClassLinks,
  addSubjectClassLink,
  removeSubjectClassLink,
  fetchChapters,
  createChapter,
  fetchTerms,
  fetchEstablishments,
  fetchChapterUnlocks,
  createChapterUnlock,
  deleteChapterUnlock,
  fetchLessons,
  createLesson,
  submitForValidation,
} from '@/lib/content/api-client';
import { fetchAcademicNodes } from '@/lib/academic/api-client';
import { CONTENT_STATUS_LABELS } from '@/lib/content/constants';
import type {
  SubjectRow,
  ChapterRow,
  LessonWithStatus,
  SubjectClassLinkItem,
  TermRow,
  EstablishmentRow,
  ChapterUnlockItem,
} from '@/lib/content/types';
import type { AcademicNodeRow } from '@/lib/academic/types';
import { cn } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  brouillon: 'bg-slate-100 text-slate-700',
  en_attente_de_validation: 'bg-amber-100 text-amber-700',
  a_corriger: 'bg-red-100 text-red-700',
  rejete: 'bg-red-100 text-red-700',
  publie: 'bg-emerald-100 text-emerald-700',
};

export function ContentPageView({ initialSubjects }: { initialSubjects: SubjectRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [error, setError] = useState<string | null>(null);

  const [academicNodes, setAcademicNodes] = useState<AcademicNodeRow[] | null>(null);
  useEffect(() => {
    fetchAcademicNodes().then(setAcademicNodes).catch((e) => setError(e.message));
  }, []);

  // Une classe assignable est une feuille de l'arbre (aucun nœud enfant) — le vocabulaire
  // varie par pays, une feuille est le seul critère fiable (même règle que accounts-page.tsx).
  const leafNodes = useMemo(() => {
    if (!academicNodes) return [];
    const parentIds = new Set(academicNodes.map((n) => n.parent_id).filter(Boolean));
    const byId = new Map(academicNodes.map((n) => [n.id, n]));
    const pathOf = (id: string): string => {
      const parts: string[] = [];
      let current = byId.get(id);
      while (current) {
        parts.unshift(current.name);
        current = current.parent_id ? byId.get(current.parent_id) : undefined;
      }
      return parts.join(' / ');
    };
    return academicNodes
      .filter((n) => !parentIds.has(n.id))
      .map((n) => ({ id: n.id, path: pathOf(n.id) }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [academicNodes]);

  const nodeById = useMemo(() => new Map((academicNodes ?? []).map((n) => [n.id, n])), [academicNodes]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [subjectClassLinks, setSubjectClassLinks] = useState<SubjectClassLinkItem[]>([]);
  const [terms, setTerms] = useState<TermRow[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentRow[]>([]);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectNodeId, setNewSubjectNodeId] = useState('');
  const [newSubjectNodeSearch, setNewSubjectNodeSearch] = useState('');

  const [addClassLinkNodeId, setAddClassLinkNodeId] = useState('');

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonWithStatus[]>([]);
  const [chapterUnlocks, setChapterUnlocks] = useState<ChapterUnlockItem[]>([]);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterTermId, setNewChapterTermId] = useState('');
  const [newUnlockEstablishmentId, setNewUnlockEstablishmentId] = useState<string>('');

  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonBody, setNewLessonBody] = useState('');

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) ?? null;
  const subjectCountryId = selectedSubject ? nodeById.get(selectedSubject.node_id)?.country_id ?? null : null;

  const refreshSubjects = () => fetchSubjects().then(setSubjects).catch((e) => setError(e.message));
  const refreshChapters = (subjectId: string) =>
    fetchChapters(subjectId).then(setChapters).catch((e) => setError(e.message));
  const refreshSubjectClassLinks = (subjectId: string) =>
    fetchSubjectClassLinks(subjectId).then(setSubjectClassLinks).catch((e) => setError(e.message));
  const refreshLessons = (chapterId: string) =>
    fetchLessons(chapterId).then(setLessons).catch((e) => setError(e.message));
  const refreshChapterUnlocks = (chapterId: string) =>
    fetchChapterUnlocks(chapterId).then(setChapterUnlocks).catch((e) => setError(e.message));

  useEffect(() => {
    if (!selectedSubjectId) return;
    refreshChapters(selectedSubjectId);
    refreshSubjectClassLinks(selectedSubjectId);
  }, [selectedSubjectId]);

  useEffect(() => {
    if (!subjectCountryId) return;
    fetchTerms(subjectCountryId).then(setTerms).catch((e) => setError(e.message));
    fetchEstablishments(subjectCountryId).then(setEstablishments).catch((e) => setError(e.message));
  }, [subjectCountryId]);

  useEffect(() => {
    if (!selectedChapterId) return;
    refreshLessons(selectedChapterId);
    refreshChapterUnlocks(selectedChapterId);
  }, [selectedChapterId]);

  const selectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setChapters([]);
    setSubjectClassLinks([]);
    setSelectedChapterId(null);
    setLessons([]);
    setChapterUnlocks([]);
    setNewChapterTermId('');
    setTerms([]);
    setEstablishments([]);
  };

  const selectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setLessons([]);
    setChapterUnlocks([]);
  };

  const runAction = (fn: () => Promise<{ error?: string }>, onSuccess?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      router.refresh();
    });
  };

  const filteredNewSubjectNodes = newSubjectNodeSearch
    ? leafNodes.filter((n) => n.path.toLowerCase().includes(newSubjectNodeSearch.toLowerCase()))
    : leafNodes;

  const linkedClassIds = new Set(subjectClassLinks.map((l) => l.class_node_id));
  const availableForLinking = leafNodes.filter(
    (n) => n.id !== selectedSubject?.node_id && !linkedClassIds.has(n.id)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion du contenu"
        description="Matières, chapitres et leçons — soumission au workflow de validation"
        breadcrumbs={[{ label: 'Académique' }, { label: 'Contenu' }]}
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Matières */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Matières
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="max-h-48">
              <div className="space-y-1">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => selectSubject(subject.id)}
                    className={cn(
                      'w-full text-left text-sm p-2 rounded-md hover:bg-muted',
                      selectedSubjectId === subject.id && 'bg-primary/10 font-medium'
                    )}
                  >
                    {subject.name}
                  </button>
                ))}
                {subjects.length === 0 && (
                  <p className="text-sm text-muted-foreground p-2">Aucune matière pour l&apos;instant.</p>
                )}
              </div>
            </ScrollArea>

            {selectedSubject && (
              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Classes liées (contenu partagé)</p>
                <div className="space-y-1">
                  {subjectClassLinks.map((link) => (
                    <div key={link.class_node_id} className="flex items-center justify-between text-sm rounded-md border px-2 py-1">
                      <span>{link.className ?? link.class_node_id}</span>
                      <button
                        onClick={() =>
                          runAction(
                            () => removeSubjectClassLink({ subjectId: selectedSubject.id, classNodeId: link.class_node_id }),
                            () => refreshSubjectClassLinks(selectedSubject.id)
                          )
                        }
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-red-600" />
                      </button>
                    </div>
                  ))}
                  {subjectClassLinks.length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucune classe supplémentaire.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select value={addClassLinkNodeId} onValueChange={(v) => setAddClassLinkNodeId(v ?? '')}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Ajouter une classe..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableForLinking.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={!addClassLinkNodeId}
                    onClick={() =>
                      runAction(
                        () => addSubjectClassLink({ subjectId: selectedSubject.id, classNodeId: addClassLinkNodeId }),
                        () => {
                          setAddClassLinkNodeId('');
                          refreshSubjectClassLinks(selectedSubject.id);
                        }
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2 border-t pt-3">
              <Input
                placeholder="Nom de la matière"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
              />
              <div>
                <Label className="text-xs">Classe de rattachement (obligatoire)</Label>
                <Input
                  placeholder="Rechercher une classe..."
                  value={newSubjectNodeSearch}
                  onChange={(e) => setNewSubjectNodeSearch(e.target.value)}
                />
                <ScrollArea className="max-h-32 mt-1 border rounded-md">
                  <div className="space-y-1 p-1">
                    {filteredNewSubjectNodes.map((n) => (
                      <button
                        key={n.id}
                        className={cn(
                          'w-full text-left text-xs p-1.5 rounded-md hover:bg-muted',
                          newSubjectNodeId === n.id && 'bg-primary/10'
                        )}
                        onClick={() => setNewSubjectNodeId(n.id)}
                      >
                        {n.path}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={() =>
                  runAction(
                    () =>
                      createSubject({
                        name: newSubjectName,
                        nodeId: newSubjectNodeId,
                        additionalClassNodeIds: [],
                      }),
                    () => {
                      setNewSubjectName('');
                      setNewSubjectNodeId('');
                      setNewSubjectNodeSearch('');
                      refreshSubjects();
                    }
                  )
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Créer la matière
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chapitres */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4" />
              Chapitres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedSubjectId && (
              <p className="text-sm text-muted-foreground py-8 text-center">Sélectionnez une matière.</p>
            )}
            {selectedSubjectId && (
              <>
                <ScrollArea className="max-h-48">
                  <div className="space-y-1">
                    {chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => selectChapter(chapter.id)}
                        className={cn(
                          'w-full text-left text-sm p-2 rounded-md hover:bg-muted',
                          selectedChapterId === chapter.id && 'bg-primary/10 font-medium'
                        )}
                      >
                        {chapter.title}
                      </button>
                    ))}
                    {chapters.length === 0 && (
                      <p className="text-sm text-muted-foreground p-2">Aucun chapitre pour l&apos;instant.</p>
                    )}
                  </div>
                </ScrollArea>

                {selectedChapterId && (
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Unlock className="h-3.5 w-3.5" />
                      Déblocage anticipé
                    </p>
                    <div className="space-y-1">
                      {chapterUnlocks.map((u) => (
                        <div key={u.id} className="flex items-center justify-between text-sm rounded-md border px-2 py-1">
                          <span>{u.establishmentName ?? 'Tout le pays'}</span>
                          <button
                            onClick={() =>
                              runAction(() => deleteChapterUnlock({ id: u.id }), () => refreshChapterUnlocks(selectedChapterId))
                            }
                          >
                            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select value={newUnlockEstablishmentId} onValueChange={(v) => setNewUnlockEstablishmentId(v ?? '')}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Tout le pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {establishments.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() =>
                          runAction(
                            () =>
                              createChapterUnlock({
                                chapterId: selectedChapterId,
                                establishmentId: newUnlockEstablishmentId || null,
                              }),
                            () => {
                              setNewUnlockEstablishmentId('');
                              refreshChapterUnlocks(selectedChapterId);
                            }
                          )
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 border-t pt-3">
                  <Input
                    placeholder="Titre du chapitre"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                  />
                  <Select value={newChapterTermId} onValueChange={(v) => setNewChapterTermId(v ?? '')}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Trimestre (obligatoire)" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} — {t.school_year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {terms.length === 0 && (
                    <p className="text-xs text-amber-700">
                      Aucun trimestre pour ce pays — créez-en un dans l&apos;écran Trimestres avant de créer un chapitre.
                    </p>
                  )}
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!newChapterTermId}
                    onClick={() =>
                      runAction(
                        () =>
                          createChapter({
                            subjectId: selectedSubjectId,
                            termId: newChapterTermId,
                            title: newChapterTitle,
                          }),
                        () => {
                          setNewChapterTitle('');
                          setNewChapterTermId('');
                          refreshChapters(selectedSubjectId);
                        }
                      )
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Créer le chapitre
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Leçons */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Leçons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedChapterId && (
              <p className="text-sm text-muted-foreground py-8 text-center">Sélectionnez un chapitre.</p>
            )}
            {selectedChapterId && (
              <>
                <ScrollArea className="max-h-72">
                  <div className="space-y-2">
                    {lessons.map((lesson) => {
                      const status = lesson.latestVersion?.status ?? 'brouillon';
                      const canSubmit = status === 'brouillon' || status === 'a_corriger';
                      return (
                        <div key={lesson.id} className="rounded-md border p-2 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{lesson.title}</p>
                            <Badge variant="outline" className={STATUS_COLOR[status]}>
                              {CONTENT_STATUS_LABELS[status] ?? status}
                            </Badge>
                          </div>
                          {canSubmit && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() =>
                                runAction(
                                  () => submitForValidation({ lessonId: lesson.id }),
                                  () => refreshLessons(selectedChapterId)
                                )
                              }
                            >
                              <Send className="h-3.5 w-3.5 mr-1" />
                              Soumettre pour validation
                            </Button>
                          )}
                        </div>
                      );
                    })}
                    {lessons.length === 0 && (
                      <p className="text-sm text-muted-foreground p-2">Aucune leçon pour l&apos;instant.</p>
                    )}
                  </div>
                </ScrollArea>
                <div className="space-y-2 border-t pt-3">
                  <div>
                    <Label>Titre</Label>
                    <Input value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label>Contenu</Label>
                    <Textarea
                      value={newLessonBody}
                      onChange={(e) => setNewLessonBody(e.target.value)}
                      placeholder="Corps de la leçon..."
                      rows={4}
                    />
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      runAction(
                        () =>
                          createLesson({
                            chapterId: selectedChapterId,
                            title: newLessonTitle,
                            bodyText: newLessonBody,
                          }),
                        () => {
                          setNewLessonTitle('');
                          setNewLessonBody('');
                          refreshLessons(selectedChapterId);
                        }
                      )
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Créer la leçon
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
