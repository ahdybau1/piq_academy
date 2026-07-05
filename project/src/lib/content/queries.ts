import 'server-only';
import { createClient } from '@/lib/supabase/server';
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

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function listSubjects(): Promise<SubjectRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('subjects').select('id, name, node_id, created_at').order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
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
    .select('id, chapter_id, title, content_json, display_order, created_at, updated_at')
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

export async function listValidationQueue(status?: string): Promise<ValidationQueueItem[]> {
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
  if (lessonIds.length === 0) {
    return rows.map((r) => ({ ...r, lessonTitle: null, chapterTitle: null, subjectName: null }));
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, title, chapter_id')
    .in('id', lessonIds);
  if (lessonsError) throw new Error(lessonsError.message);

  const chapterIds = Array.from(new Set((lessons ?? []).map((l) => l.chapter_id)));
  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select('id, title, subject_id')
    .in('id', chapterIds.length > 0 ? chapterIds : ['00000000-0000-0000-0000-000000000000']);
  if (chaptersError) throw new Error(chaptersError.message);

  const subjectIds = Array.from(new Set((chapters ?? []).map((c) => c.subject_id)));
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('id, name')
    .in('id', subjectIds.length > 0 ? subjectIds : ['00000000-0000-0000-0000-000000000000']);
  if (subjectsError) throw new Error(subjectsError.message);

  const lessonById = new Map((lessons ?? []).map((l) => [l.id, l]));
  const chapterById = new Map((chapters ?? []).map((c) => [c.id, c]));
  const subjectById = new Map((subjects ?? []).map((s) => [s.id, s.name]));

  return rows.map((r) => {
    if (r.content_type !== 'lesson') return { ...r, lessonTitle: null, chapterTitle: null, subjectName: null };
    const lesson = lessonById.get(r.content_id);
    const chapter = lesson ? chapterById.get(lesson.chapter_id) : undefined;
    return {
      ...r,
      lessonTitle: lesson?.title ?? null,
      chapterTitle: chapter?.title ?? null,
      subjectName: chapter ? subjectById.get(chapter.subject_id) ?? null : null,
    };
  });
}
