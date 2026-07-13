import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { OfficialExamRow, ExamPaperItem, ExamTypeClassItem, ExamPaperSharedExamItem } from './types';
import type { SubjectRow } from '@/lib/content/types';

export async function listOfficialExams(countryId?: string): Promise<OfficialExamRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from('official_exams')
    .select('id, country_id, name, exam_date, created_at')
    .order('name', { ascending: true });
  if (countryId) query = query.eq('country_id', countryId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Classes/séries habilitées à composer un examen (section 3). */
export async function listExamTypeClasses(examTypeId: string): Promise<ExamTypeClassItem[]> {
  const supabase = await createClient();
  const { data: links, error } = await supabase
    .from('exam_type_classes')
    .select('id, exam_type_id, class_node_id')
    .eq('exam_type_id', examTypeId);
  if (error) throw new Error(error.message);
  if (!links || links.length === 0) return [];

  const { data: nodes, error: nodesError } = await supabase
    .from('academic_nodes')
    .select('id, name')
    .in('id', links.map((l) => l.class_node_id));
  if (nodesError) throw new Error(nodesError.message);
  const nameById = new Map((nodes ?? []).map((n) => [n.id, n.name]));

  return links
    .map((l) => ({ ...l, className: nameById.get(l.class_node_id) ?? null }))
    .sort((a, b) => (a.className ?? '').localeCompare(b.className ?? ''));
}

/**
 * Matières applicables à un examen : union des matières (tronc commun inclus) de toutes ses
 * classes habilitées. Sans ça, un examen rattaché à plusieurs séries (ex. Probatoire A4)
 * n'exposerait que les matières d'une seule d'entre elles lors de la création d'une épreuve.
 */
export async function listSubjectsForExamType(examTypeId: string): Promise<SubjectRow[]> {
  const supabase = await createClient();

  const { data: links, error: linksError } = await supabase
    .from('exam_type_classes')
    .select('class_node_id')
    .eq('exam_type_id', examTypeId);
  if (linksError) throw new Error(linksError.message);

  const classNodeIds = (links ?? []).map((l) => l.class_node_id);
  if (classNodeIds.length === 0) return [];

  const [primaryRes, linkedRes] = await Promise.all([
    supabase.from('subjects').select('id, name, node_id, created_at').in('node_id', classNodeIds),
    supabase.from('subject_class_links').select('subject_id').in('class_node_id', classNodeIds),
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

/** Autres examens avec lesquels une épreuve est partagée (ex. Philosophie commune à Probatoire C et D). */
export async function listExamPaperSharedExams(examPaperId: string): Promise<ExamPaperSharedExamItem[]> {
  const supabase = await createClient();
  const { data: links, error } = await supabase
    .from('exam_paper_shared_exams')
    .select('id, exam_paper_id, exam_type_id')
    .eq('exam_paper_id', examPaperId);
  if (error) throw new Error(error.message);
  if (!links || links.length === 0) return [];

  const { data: exams, error: examsError } = await supabase
    .from('official_exams')
    .select('id, name')
    .in('id', links.map((l) => l.exam_type_id));
  if (examsError) throw new Error(examsError.message);
  const nameById = new Map((exams ?? []).map((e) => [e.id, e.name]));

  return links
    .map((l) => ({ ...l, examName: nameById.get(l.exam_type_id) ?? null }))
    .sort((a, b) => (a.examName ?? '').localeCompare(b.examName ?? ''));
}
