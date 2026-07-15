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

/**
 * Un examen officiel (BEPC, Probatoire C…) est d'abord un type, pas une classe unique — les
 * classes/séries habilitées à le composer sont gérées séparément via `exam_type_classes`
 * (section 3, retour utilisateur : "en 6e on ne compose aucun examen"). `initialClassNodeIds`
 * permet de les déclarer dès la création, comme `additionalClassNodeIds` pour une matière.
 */
export async function createOfficialExam(input: {
  countryId: string;
  name: string;
  examDate: string | null;
  initialClassNodeIds: string[];
  adminId: string | null;
}): Promise<MutationResult> {
  const name = input.name.trim();
  if (!input.countryId) return { error: 'Le pays est requis.' };
  if (!name) return { error: "Le nom de l'examen est requis." };

  const supabase = await createClient();
  const { data: exam, error } = await supabase
    .from('official_exams')
    .insert({ country_id: input.countryId, name, exam_date: input.examDate })
    .select('id')
    .single();
  if (error) return { error: error.message };

  if (input.initialClassNodeIds.length > 0) {
    const { error: linksError } = await supabase
      .from('exam_type_classes')
      .insert(input.initialClassNodeIds.map((classNodeId) => ({ exam_type_id: exam.id, class_node_id: classNodeId })));
    if (linksError) return { error: linksError.message };
  }

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'official_exams',
    entity_id: exam.id,
    before_json: null,
    after_json: { name, exam_date: input.examDate, class_node_ids: input.initialClassNodeIds },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function updateOfficialExam(input: {
  id: string;
  name: string;
  examDate: string | null;
  adminId: string | null;
}): Promise<MutationResult> {
  const name = input.name.trim();
  if (!name) return { error: "Le nom de l'examen est requis." };

  const supabase = await createClient();
  const { error } = await supabase.from('official_exams').update({ name, exam_date: input.examDate }).eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'update',
    entity_type: 'official_exams',
    entity_id: input.id,
    before_json: null,
    after_json: { name, exam_date: input.examDate },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/** Ajoute une classe/série à la liste des classes habilitées à composer cet examen (section 3). */
export async function addExamTypeClass(input: { examTypeId: string; classNodeId: string; adminId: string | null }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('exam_type_classes')
    .insert({ exam_type_id: input.examTypeId, class_node_id: input.classNodeId });
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'exam_type_classes',
    entity_id: input.examTypeId,
    before_json: null,
    after_json: { class_node_id: input.classNodeId },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function removeExamTypeClass(input: { examTypeId: string; classNodeId: string; adminId: string | null }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('exam_type_classes')
    .delete()
    .eq('exam_type_id', input.examTypeId)
    .eq('class_node_id', input.classNodeId);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'delete',
    entity_type: 'exam_type_classes',
    entity_id: input.examTypeId,
    before_json: { class_node_id: input.classNodeId },
    after_json: null,
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
    const paperIds = papers.map((p) => p.id);
    const { data: sharedLinks, error: sharedLinksError } = await supabase
      .from('exam_paper_shared_exams')
      .select('*')
      .in('exam_paper_id', paperIds);
    if (sharedLinksError) return { error: sharedLinksError.message };
    if (sharedLinks && sharedLinks.length > 0) {
      const sharedTrash = await trashRows({ batchId, tableName: 'exam_paper_shared_exams', rows: sharedLinks, adminId: input.adminId });
      if (sharedTrash.error) return sharedTrash;
      const { error: deleteSharedError } = await supabase.from('exam_paper_shared_exams').delete().in('exam_paper_id', paperIds);
      if (deleteSharedError) return { error: deleteSharedError.message };
    }

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

  const { data: classLinks, error: classLinksError } = await supabase
    .from('exam_type_classes')
    .select('*')
    .eq('exam_type_id', input.id);
  if (classLinksError) return { error: classLinksError.message };
  if (classLinks && classLinks.length > 0) {
    const classLinksTrash = await trashRows({ batchId, tableName: 'exam_type_classes', rows: classLinks, adminId: input.adminId });
    if (classLinksTrash.error) return classLinksTrash;
    const { error: deleteClassLinksError } = await supabase.from('exam_type_classes').delete().eq('exam_type_id', input.id);
    if (deleteClassLinksError) return { error: deleteClassLinksError.message };
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

  const batchId = crypto.randomUUID();

  const { data: sharedLinks, error: sharedLinksError } = await supabase
    .from('exam_paper_shared_exams')
    .select('*')
    .eq('exam_paper_id', input.id);
  if (sharedLinksError) return { error: sharedLinksError.message };
  if (sharedLinks && sharedLinks.length > 0) {
    const sharedTrash = await trashRows({ batchId, tableName: 'exam_paper_shared_exams', rows: sharedLinks, adminId: input.adminId });
    if (sharedTrash.error) return sharedTrash;
    const { error: deleteSharedError } = await supabase.from('exam_paper_shared_exams').delete().eq('exam_paper_id', input.id);
    if (deleteSharedError) return { error: deleteSharedError.message };
  }

  const trashResult = await trashRows({
    batchId,
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

/**
 * Partage une épreuve déjà créée avec un autre examen (section 3, retour utilisateur : "deux
 * examens différents [...] ont parmi les épreuves une ou plusieurs épreuves communes").
 * L'épreuve reste possédée par son examen d'origine (`exam_papers.exam_id`) ; ce lien ne fait
 * que la rendre visible/exploitable sous un examen supplémentaire.
 */
export async function addExamPaperSharedExam(input: {
  examPaperId: string;
  examTypeId: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: paper, error: paperError } = await supabase.from('exam_papers').select('exam_id').eq('id', input.examPaperId).maybeSingle();
  if (paperError) return { error: paperError.message };
  if (!paper) return { error: 'Épreuve introuvable.' };
  if (paper.exam_id === input.examTypeId) return { error: 'Cette épreuve appartient déjà à cet examen.' };

  const { error } = await supabase
    .from('exam_paper_shared_exams')
    .insert({ exam_paper_id: input.examPaperId, exam_type_id: input.examTypeId });
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'exam_paper_shared_exams',
    entity_id: input.examPaperId,
    before_json: null,
    after_json: { exam_type_id: input.examTypeId },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function removeExamPaperSharedExam(input: {
  examPaperId: string;
  examTypeId: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('exam_paper_shared_exams')
    .delete()
    .eq('exam_paper_id', input.examPaperId)
    .eq('exam_type_id', input.examTypeId);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'delete',
    entity_type: 'exam_paper_shared_exams',
    entity_id: input.examPaperId,
    before_json: { exam_type_id: input.examTypeId },
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
  if (uploadError) {
    console.error('[uploadExamDocument] Supabase Storage upload failed:', uploadError);
    return { error: `Échec de l'upload Storage : ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(EXAM_PAPERS_BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}
