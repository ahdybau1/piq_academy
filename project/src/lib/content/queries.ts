import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { EXERCISE_FORMATS } from '@/lib/exercises/constants';
import type {
  SubjectRow,
  ChapterRow,
  LessonWithStatus,
  ContentVersionRow,
  ValidationQueueItem,
  SubjectClassLinkItem,
  TermRow,
  ChapterUnlockItem,
  CatalogEntryRow,
  EstablishmentRow,
} from './types';

const EXERCISE_FORMAT_LABELS = new Map(EXERCISE_FORMATS.map((f) => [f.value, f.label]));

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * @param countryId Filtre optionnel : ne retourne que les matières rattachées à un nœud
 * (racine ou descendant) de ce pays. Omis ou `undefined`, le comportement est inchangé
 * (toutes les matières).
 */
export async function listSubjects(countryId?: string): Promise<SubjectRow[]> {
  const supabase = await createClient();

  if (countryId) {
    const { data: nodeData, error: nodeError } = await supabase
      .from('academic_nodes')
      .select('id')
      .or(`id.eq.${countryId},country_id.eq.${countryId}`);
    if (nodeError) throw new Error(nodeError.message);

    const nodeIds = (nodeData ?? []).map((n) => n.id);
    if (nodeIds.length === 0) return [];

    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, node_id, created_at')
      .in('node_id', nodeIds)
      .order('name');
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  const { data, error } = await supabase.from('subjects').select('id, name, node_id, created_at').order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Matières applicables à une classe donnée : rattachement direct (node_id) OU partagé via
 * un tronc commun (subject_class_links, section 1.5 — ex. "C+D : Informatique"). Sans
 * cette union, une matière en tronc commun serait invisible dès qu'on choisit une classe
 * qui n'est pas sa classe de rattachement primaire.
 */
export async function listSubjectsForClass(classNodeId: string): Promise<SubjectRow[]> {
  const supabase = await createClient();

  const [primaryRes, linkedRes] = await Promise.all([
    supabase.from('subjects').select('id, name, node_id, created_at').eq('node_id', classNodeId),
    supabase.from('subject_class_links').select('subject_id').eq('class_node_id', classNodeId),
  ]);
  if (primaryRes.error) throw new Error(primaryRes.error.message);
  if (linkedRes.error) throw new Error(linkedRes.error.message);

  const linkedSubjectIds = (linkedRes.data ?? []).map((l) => l.subject_id);
  let linkedSubjects: SubjectRow[] = [];
  if (linkedSubjectIds.length > 0) {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, node_id, created_at')
      .in('id', linkedSubjectIds);
    if (error) throw new Error(error.message);
    linkedSubjects = data ?? [];
  }

  const byId = new Map([...(primaryRes.data ?? []), ...linkedSubjects].map((s) => [s.id, s]));
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function listChapters(subjectId?: string): Promise<ChapterRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from('chapters')
    .select('id, subject_id, term_id, title, introduction, display_order, created_at')
    .order('display_order', { ascending: true });
  if (subjectId) query = query.eq('subject_id', subjectId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listSubjectClassLinks(subjectId: string): Promise<SubjectClassLinkItem[]> {
  const supabase = await createClient();
  const { data: links, error } = await supabase
    .from('subject_class_links')
    .select('subject_id, class_node_id')
    .eq('subject_id', subjectId);
  if (error) throw new Error(error.message);
  if (!links || links.length === 0) return [];

  const { data: nodes, error: nodesError } = await supabase
    .from('academic_nodes')
    .select('id, name')
    .in('id', links.map((l) => l.class_node_id));
  if (nodesError) throw new Error(nodesError.message);
  const nameById = new Map((nodes ?? []).map((n) => [n.id, n.name]));

  return links.map((l) => ({ ...l, className: nameById.get(l.class_node_id) ?? null }));
}

export async function listTerms(countryId?: string): Promise<TermRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from('terms')
    .select('id, country_id, name, school_year, start_date, end_date')
    .order('start_date', { ascending: true });
  if (countryId) query = query.eq('country_id', countryId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listChapterUnlocks(chapterId: string): Promise<ChapterUnlockItem[]> {
  const supabase = await createClient();
  const { data: unlocks, error } = await supabase
    .from('chapter_unlocks')
    .select('id, chapter_id, establishment_id, admin_id, created_at')
    .eq('chapter_id', chapterId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  if (!unlocks || unlocks.length === 0) return [];

  const establishmentIds = unlocks.map((u) => u.establishment_id).filter((v): v is string => !!v);
  let nameById = new Map<string, string>();
  if (establishmentIds.length > 0) {
    const { data: establishments, error: establishmentsError } = await supabase
      .from('establishments')
      .select('id, name')
      .in('id', establishmentIds);
    if (establishmentsError) throw new Error(establishmentsError.message);
    nameById = new Map((establishments ?? []).map((e) => [e.id, e.name]));
  }

  return unlocks.map((u) => ({
    ...u,
    establishmentName: u.establishment_id ? nameById.get(u.establishment_id) ?? null : null,
  }));
}

/** Lecture seule minimale pour peupler le picker d'établissement du déblocage anticipé (1.8). */
export async function listEstablishments(countryId?: string): Promise<EstablishmentRow[]> {
  const supabase = await createClient();
  let query = supabase.from('establishments').select('id, name, country_id').order('name');
  if (countryId) query = query.eq('country_id', countryId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listCatalog(subjectId: string): Promise<CatalogEntryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content_catalog')
    .select('id, subject_id, element_type, is_active, created_at')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Résout la dernière version (par version_number) de chaque leçon d'un chapitre. */
export async function listLessons(chapterId: string): Promise<LessonWithStatus[]> {
  const supabase = await createClient();
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('id, chapter_id, title, content_json, display_order, catalog_id, created_at, updated_at')
    .eq('chapter_id', chapterId)
    .order('display_order', { ascending: true });
  if (error) throw new Error(error.message);
  if (!lessons || lessons.length === 0) return [];

  const lessonIds = lessons.map((l) => l.id);
  const { data: versions, error: versionsError } = await supabase
    .from('content_versions')
    .select('id, content_id, version_number, content_json, status, created_at')
    .in('content_id', lessonIds)
    .order('version_number', { ascending: false });
  if (versionsError) throw new Error(versionsError.message);

  const latestByLesson = new Map<string, ContentVersionRow>();
  (versions ?? []).forEach((v) => {
    if (!latestByLesson.has(v.content_id)) latestByLesson.set(v.content_id, v);
  });

  return lessons.map((lesson) => ({ ...lesson, latestVersion: latestByLesson.get(lesson.id) ?? null }));
}

/**
 * @param countryId Filtre optionnel : ne retourne que les soumissions dont la matière
 * (via lesson/exercise → chapter → subject → node_id, ou directement subject pour un
 * exercice indépendant) appartient à ce pays. Les entrées dont on ne peut pas résoudre
 * le pays (content_type autre que 'lesson'/'exercise') sont exclues quand un filtre est
 * actif — on ne les affiche que dans la vue "tous les pays".
 */
export async function listValidationQueue(status?: string, countryId?: string): Promise<ValidationQueueItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from('validation_queue')
    .select(
      'id, content_type, content_id, status, submitted_by, reviewed_by, rejection_reason, ai_report_json, created_at, reviewed_at'
    )
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data: rows, error } = await query;
  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return [];

  const lessonIds = rows.filter((r) => r.content_type === 'lesson').map((r) => r.content_id);
  const exerciseIds = rows.filter((r) => r.content_type === 'exercise').map((r) => r.content_id);
  const establishmentPaperIds = rows.filter((r) => r.content_type === 'establishment_paper').map((r) => r.content_id);

  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, title, chapter_id')
    .in('id', lessonIds.length > 0 ? lessonIds : ['00000000-0000-0000-0000-000000000000']);
  if (lessonsError) throw new Error(lessonsError.message);

  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('id, format, lesson_id, chapter_id, subject_id')
    .in('id', exerciseIds.length > 0 ? exerciseIds : ['00000000-0000-0000-0000-000000000000']);
  if (exercisesError) throw new Error(exercisesError.message);

  const { data: establishmentPapers, error: establishmentPapersError } = await supabase
    .from('establishment_papers')
    .select('id, establishment_id, class_node_id, subject_id, year')
    .in('id', establishmentPaperIds.length > 0 ? establishmentPaperIds : ['00000000-0000-0000-0000-000000000000']);
  if (establishmentPapersError) throw new Error(establishmentPapersError.message);

  const lessonById = new Map((lessons ?? []).map((l) => [l.id, l]));
  const exerciseById = new Map((exercises ?? []).map((e) => [e.id, e]));
  const establishmentPaperById = new Map((establishmentPapers ?? []).map((p) => [p.id, p]));

  const chapterIds = new Set<string>();
  (lessons ?? []).forEach((l) => chapterIds.add(l.chapter_id));
  (exercises ?? []).forEach((e) => {
    if (e.chapter_id) chapterIds.add(e.chapter_id);
  });

  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select('id, title, subject_id')
    .in('id', chapterIds.size > 0 ? Array.from(chapterIds) : ['00000000-0000-0000-0000-000000000000']);
  if (chaptersError) throw new Error(chaptersError.message);
  const chapterById = new Map((chapters ?? []).map((c) => [c.id, c]));

  const subjectIds = new Set<string>();
  (chapters ?? []).forEach((c) => subjectIds.add(c.subject_id));
  (exercises ?? []).forEach((e) => {
    if (e.subject_id) subjectIds.add(e.subject_id);
  });
  (establishmentPapers ?? []).forEach((p) => subjectIds.add(p.subject_id));

  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('id, name, node_id')
    .in('id', subjectIds.size > 0 ? Array.from(subjectIds) : ['00000000-0000-0000-0000-000000000000']);
  if (subjectsError) throw new Error(subjectsError.message);
  const subjectById = new Map((subjects ?? []).map((s) => [s.id, s]));

  const { data: establishments, error: establishmentsError } = await supabase
    .from('establishments')
    .select('id, name, country_id')
    .in(
      'id',
      (establishmentPapers ?? []).length > 0
        ? (establishmentPapers ?? []).map((p) => p.establishment_id)
        : ['00000000-0000-0000-0000-000000000000']
    );
  if (establishmentsError) throw new Error(establishmentsError.message);
  const establishmentById = new Map((establishments ?? []).map((e) => [e.id, e]));

  const { data: paperNodes, error: paperNodesError } = await supabase
    .from('academic_nodes')
    .select('id, name')
    .in(
      'id',
      (establishmentPapers ?? []).length > 0
        ? (establishmentPapers ?? []).map((p) => p.class_node_id)
        : ['00000000-0000-0000-0000-000000000000']
    );
  if (paperNodesError) throw new Error(paperNodesError.message);
  const paperNodeNameById = new Map((paperNodes ?? []).map((n) => [n.id, n.name]));

  let allowedSubjectIds: Set<string> | null = null;
  let allowedEstablishmentIds: Set<string> | null = null;
  if (countryId) {
    const { data: nodeData, error: nodeError } = await supabase
      .from('academic_nodes')
      .select('id')
      .or(`id.eq.${countryId},country_id.eq.${countryId}`);
    if (nodeError) throw new Error(nodeError.message);
    const nodeIds = new Set((nodeData ?? []).map((n) => n.id));
    allowedSubjectIds = new Set((subjects ?? []).filter((s) => nodeIds.has(s.node_id)).map((s) => s.id));
    allowedEstablishmentIds = new Set(
      (establishments ?? []).filter((e) => e.country_id === countryId).map((e) => e.id)
    );
  }

  /** Résout (chapterId, subjectId) pour une leçon ou un exercice, quel que soit son niveau de rattachement. */
  function resolveSubjectId(r: NonNullable<typeof rows>[number]): string | null {
    if (r.content_type === 'lesson') {
      const lesson = lessonById.get(r.content_id);
      const chapter = lesson ? chapterById.get(lesson.chapter_id) : undefined;
      return chapter?.subject_id ?? null;
    }
    if (r.content_type === 'exercise') {
      const exercise = exerciseById.get(r.content_id);
      if (!exercise) return null;
      if (exercise.subject_id) return exercise.subject_id;
      if (exercise.chapter_id) return chapterById.get(exercise.chapter_id)?.subject_id ?? null;
      if (exercise.lesson_id) {
        const lesson = lessonById.get(exercise.lesson_id);
        const chapter = lesson ? chapterById.get(lesson.chapter_id) : undefined;
        return chapter?.subject_id ?? null;
      }
    }
    return null;
  }

  return rows
    .filter((r) => {
      if (!allowedSubjectIds) return true;
      if (r.content_type === 'establishment_paper') {
        const paper = establishmentPaperById.get(r.content_id);
        return paper ? (allowedEstablishmentIds?.has(paper.establishment_id) ?? false) : false;
      }
      if (r.content_type !== 'lesson' && r.content_type !== 'exercise') return false;
      const subjectId = resolveSubjectId(r);
      return subjectId ? allowedSubjectIds.has(subjectId) : false;
    })
    .map((r) => {
      if (r.content_type === 'lesson') {
        const lesson = lessonById.get(r.content_id);
        const chapter = lesson ? chapterById.get(lesson.chapter_id) : undefined;
        return {
          ...r,
          lessonTitle: lesson?.title ?? null,
          chapterTitle: chapter?.title ?? null,
          subjectName: chapter ? subjectById.get(chapter.subject_id)?.name ?? null : null,
        };
      }
      if (r.content_type === 'exercise') {
        const exercise = exerciseById.get(r.content_id);
        const chapter = exercise?.chapter_id ? chapterById.get(exercise.chapter_id) : undefined;
        const subjectId = resolveSubjectId(r);
        return {
          ...r,
          lessonTitle: exercise ? `Exercice — ${EXERCISE_FORMAT_LABELS.get(exercise.format) ?? exercise.format}` : null,
          chapterTitle: chapter?.title ?? null,
          subjectName: subjectId ? subjectById.get(subjectId)?.name ?? null : null,
        };
      }
      if (r.content_type === 'establishment_paper') {
        const paper = establishmentPaperById.get(r.content_id);
        const establishmentName = paper ? establishmentById.get(paper.establishment_id)?.name ?? null : null;
        const className = paper ? paperNodeNameById.get(paper.class_node_id) ?? null : null;
        return {
          ...r,
          lessonTitle: establishmentName ? `Épreuve — ${establishmentName}` : null,
          chapterTitle: className,
          subjectName: paper ? subjectById.get(paper.subject_id)?.name ?? null : null,
        };
      }
      return { ...r, lessonTitle: null, chapterTitle: null, subjectName: null };
    });
}
