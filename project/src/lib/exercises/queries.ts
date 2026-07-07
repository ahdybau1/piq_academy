import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { ContentVersionRow } from '@/lib/content/types';
import type { ExerciseRow, ExerciseWithStatus } from './types';

const EXERCISE_COLUMNS =
  'id, lesson_id, chapter_id, subject_id, type, difficulty, format, content_json, min_subscription_tier, display_order, catalog_id, created_at';

async function withLatestVersions(exercises: ExerciseRow[]): Promise<ExerciseWithStatus[]> {
  if (exercises.length === 0) return [];
  const supabase = await createClient();

  const exerciseIds = exercises.map((e) => e.id);
  const { data: versions, error: versionsError } = await supabase
    .from('content_versions')
    .select('id, content_id, version_number, content_json, status, created_at')
    .in('content_id', exerciseIds)
    .order('version_number', { ascending: false });
  if (versionsError) throw new Error(versionsError.message);

  const latestByExercise = new Map<string, ContentVersionRow>();
  (versions ?? []).forEach((v) => {
    if (!latestByExercise.has(v.content_id)) latestByExercise.set(v.content_id, v);
  });

  return exercises.map((exercise) => ({
    ...exercise,
    latestVersion: latestByExercise.get(exercise.id) ?? null,
    chapterTitle: null,
    subjectName: null,
  }));
}

/** Exercices rattachés à une leçon précise (section 2.4, niveau 1). */
export async function listExercisesByLesson(lessonId: string): Promise<ExerciseWithStatus[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exercises')
    .select(EXERCISE_COLUMNS)
    .eq('lesson_id', lessonId)
    .order('display_order', { ascending: true });
  if (error) throw new Error(error.message);
  return withLatestVersions(data ?? []);
}

/** Exercices rattachés à un chapitre, hors leçon précise (section 2.4, niveau 2). */
export async function listExercisesByChapter(chapterId: string): Promise<ExerciseWithStatus[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exercises')
    .select(EXERCISE_COLUMNS)
    .eq('chapter_id', chapterId)
    .is('lesson_id', null)
    .order('display_order', { ascending: true });
  if (error) throw new Error(error.message);
  return withLatestVersions(data ?? []);
}

/** Exercices indépendants de tout chapitre/leçon, rattachés directement à la matière (section 2.4, niveau 3). */
export async function listExercisesBySubject(subjectId: string): Promise<ExerciseWithStatus[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exercises')
    .select(EXERCISE_COLUMNS)
    .eq('subject_id', subjectId)
    .is('chapter_id', null)
    .order('display_order', { ascending: true });
  if (error) throw new Error(error.message);
  return withLatestVersions(data ?? []);
}
