import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { OfficialExamRow, ExamPaperItem } from './types';

export async function listOfficialExams(countryId?: string): Promise<OfficialExamRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from('official_exams')
    .select('id, country_id, class_node_id, name, exam_date, created_at')
    .order('exam_date', { ascending: false });
  if (countryId) query = query.eq('country_id', countryId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listExamPapers(examId: string): Promise<ExamPaperItem[]> {
  const supabase = await createClient();
  const { data: papers, error } = await supabase
    .from('exam_papers')
    .select('id, exam_id, subject_id, year, document_url, correction_url, correction_visible, created_at')
    .eq('exam_id', examId)
    .order('year', { ascending: false });
  if (error) throw new Error(error.message);
  if (!papers || papers.length === 0) return [];

  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('id, name')
    .in('id', papers.map((p) => p.subject_id));
  if (subjectsError) throw new Error(subjectsError.message);
  const nameById = new Map((subjects ?? []).map((s) => [s.id, s.name]));

  return papers.map((p) => ({ ...p, subjectName: nameById.get(p.subject_id) ?? null }));
}
