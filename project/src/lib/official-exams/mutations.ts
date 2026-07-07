import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { trashRows } from '@/lib/trash/mutations';
import { EXAM_PAPER_MAX_SIZE_BYTES } from './constants';

export interface MutationResult {
  error?: string;
}

export interface UploadResult {
  error?: string;
  url?: string;
}

const EXAM_PAPERS_BUCKET = 'exam-papers';

export async function createOfficialExam(input: {
  countryId: string;
  classNodeId: string;
  name: string;
  examDate: string | null;
  adminId: string | null;
}): Promise<MutationResult> {
  const name = input.name.trim();
  if (!input.countryId) return { error: 'Le pays est requis.' };
  if (!input.classNodeId) return { error: 'La classe est requise.' };
  if (!name) return { error: "Le nom de l'examen est requis." };

  const supabase = await createClient();
  const { data: exam, error } = await supabase
    .from('official_exams')
    .insert({ country_id: input.countryId, class_node_id: input.classNodeId, name, exam_date: input.examDate })
    .select('id')
    .single();
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'official_exams',
    entity_id: exam.id,
    before_json: null,
    after_json: { name, class_node_id: input.classNodeId, exam_date: input.examDate },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function updateOfficialExam(input: {
  id: string;
  classNodeId: string;
  name: string;
  examDate: string | null;
  adminId: string | null;
}): Promise<MutationResult> {
  const name = input.name.trim();
  if (!input.classNodeId) return { error: 'La classe est requise.' };
  if (!name) return { error: "Le nom de l'examen est requis." };

  const supabase = await createClient();
  const { error } = await supabase
    .from('official_exams')
    .update({ class_node_id: input.classNodeId, name, exam_date: input.examDate })
    .eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'update',
    entity_type: 'official_exams',
    entity_id: input.id,
    before_json: null,
    after_json: { name, class_node_id: input.classNodeId, exam_date: input.examDate },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * Un examen officiel sans épreuve rattachée est inerte — mais le supprimer alors qu'il a
 * déjà des épreuves détruirait silencieusement des sujets/corrections déjà en ligne.
 * Bloque sans confirmation explicite (`cascade`), comme le catalogue et l'arbre académique.
 */
export async function deleteOfficialExam(input: {
  id: string;
  cascade: boolean;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: before, error: beforeError } = await supabase
    .from('official_exams')
    .select('*')
    .eq('id', input.id)
    .maybeSingle();
  if (beforeError) return { error: beforeError.message };
  if (!before) return { error: 'Examen introuvable.' };

  const { data: papers, error: papersError } = await supabase
    .from('exam_papers')
    .select('*')
    .eq('exam_id', input.id);
  if (papersError) return { error: papersError.message };

  if (!input.cascade && (papers?.length ?? 0) > 0) {
    return { error: `Cet examen a ${papers!.length} épreuve(s) rattachée(s). Confirmez pour tout supprimer.` };
  }

  const batchId = crypto.randomUUID();

  if (papers && papers.length > 0) {
    const paperTrash = await trashRows({
      batchId,
      tableName: 'exam_papers',
      rows: papers as Record<string, unknown>[],
      adminId: input.adminId,
    });
    if (paperTrash.error) return paperTrash;

    const { error: deletePapersError } = await supabase.from('exam_papers').delete().eq('exam_id', input.id);
    if (deletePapersError) return { error: deletePapersError.message };
  }

  const examTrash = await trashRows({
    batchId,
    tableName: 'official_exams',
    rows: [before as Record<string, unknown>],
    adminId: input.adminId,
  });
  if (examTrash.error) return examTrash;

  const { error } = await supabase.from('official_exams').delete().eq('id', input.id);
  if (error) return { error: error.message };

  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'delete',
    entity_type: 'official_exams',
    entity_id: input.id,
    before_json: before,
    after_json: null,
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function createExamPaper(input: {
  examId: string;
  subjectId: string;
  year: number;
  documentUrl: string | null;
  correctionUrl: string | null;
  correctionVisible: boolean;
  adminId: string | null;
}): Promise<MutationResult> {
  if (!input.subjectId) return { error: 'La matière est requise.' };
  if (!input.year) return { error: "L'année est requise." };

  const supabase = await createClient();
  const { data: paper, error } = await supabase
    .from('exam_papers')
    .insert({
      exam_id: input.examId,
      subject_id: input.subjectId,
      year: input.year,
      document_url: input.documentUrl,
      correction_url: input.correctionUrl,
      correction_visible: input.correctionVisible,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'exam_papers',
    entity_id: paper.id,
    before_json: null,
    after_json: { subject_id: input.subjectId, year: input.year },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function updateExamPaper(input: {
  id: string;
  subjectId: string;
  year: number;
  documentUrl: string | null;
  correctionUrl: string | null;
  correctionVisible: boolean;
  adminId: string | null;
}): Promise<MutationResult> {
  if (!input.subjectId) return { error: 'La matière est requise.' };
  if (!input.year) return { error: "L'année est requise." };

  const supabase = await createClient();
  const { error } = await supabase
    .from('exam_papers')
    .update({
      subject_id: input.subjectId,
      year: input.year,
      document_url: input.documentUrl,
      correction_url: input.correctionUrl,
      correction_visible: input.correctionVisible,
    })
    .eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'update',
    entity_type: 'exam_papers',
    entity_id: input.id,
    before_json: null,
    after_json: { subject_id: input.subjectId, year: input.year, correction_visible: input.correctionVisible },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function deleteExamPaper(input: { id: string; adminId: string | null }): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: before, error: beforeError } = await supabase.from('exam_papers').select('*').eq('id', input.id).maybeSingle();
  if (beforeError) return { error: beforeError.message };
  if (!before) return { error: 'Épreuve introuvable.' };

  const trashResult = await trashRows({
    batchId: crypto.randomUUID(),
    tableName: 'exam_papers',
    rows: [before as Record<string, unknown>],
    adminId: input.adminId,
  });
  if (trashResult.error) return trashResult;

  const { error } = await supabase.from('exam_papers').delete().eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'delete',
    entity_type: 'exam_papers',
    entity_id: input.id,
    before_json: before,
    after_json: null,
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/** Upload direct d'un PDF (sujet ou correction) dans le bucket dédié — aucune ligne DB créée ici, l'URL est stockée sur l'épreuve elle-même. */
export async function uploadExamDocument(input: { file: File }): Promise<UploadResult> {
  const { file } = input;
  if (file.type !== 'application/pdf') return { error: 'Seuls les fichiers PDF sont acceptés.' };
  if (file.size > EXAM_PAPER_MAX_SIZE_BYTES) {
    return { error: `Fichier trop volumineux (max ${Math.round(EXAM_PAPER_MAX_SIZE_BYTES / (1024 * 1024))} Mo).` };
  }

  const supabase = await createClient();
  const path = `${crypto.randomUUID()}.pdf`;

  const { error: uploadError } = await supabase.storage.from(EXAM_PAPERS_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(EXAM_PAPERS_BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}
