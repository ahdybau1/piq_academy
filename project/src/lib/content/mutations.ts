import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { trashRows } from '@/lib/trash/mutations';
import type { ContentStatus } from './types';

export interface MutationResult {
  error?: string;
}

/**
 * Une matière nécessite une classe de rattachement de base (node_id, section 1.5) ; les
 * classes additionnelles partagent le même contenu sans duplication (subject_class_links).
 */
export async function createSubject(input: {
  name: string;
  nodeId: string;
  additionalClassNodeIds: string[];
}): Promise<MutationResult> {
  const name = input.name.trim();
  if (!name) return { error: 'Le nom de la matière est requis.' };
  if (!input.nodeId) return { error: 'La classe de rattachement est requise.' };

  const supabase = await createClient();
  const { data: subject, error } = await supabase
    .from('subjects')
    .insert({ name, node_id: input.nodeId })
    .select('id')
    .single();
  if (error) return { error: error.message };

  if (input.additionalClassNodeIds.length > 0) {
    const { error: linksError } = await supabase
      .from('subject_class_links')
      .insert(input.additionalClassNodeIds.map((classNodeId) => ({ subject_id: subject.id, class_node_id: classNodeId })));
    if (linksError) return { error: linksError.message };
  }

  return {};
}

export async function addSubjectClassLink(input: { subjectId: string; classNodeId: string }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('subject_class_links')
    .insert({ subject_id: input.subjectId, class_node_id: input.classNodeId });
  if (error) return { error: error.message };
  return {};
}

/**
 * Retire une classe du partage (section 1.5 : "si une classe est retirée d'un groupe, ses
 * élèves perdent l'accès"). L'application de cette règle côté lecture élève est hors
 * périmètre — l'Application Élève n'existe pas encore dans ce dépôt.
 */
export async function removeSubjectClassLink(input: { subjectId: string; classNodeId: string }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('subject_class_links')
    .delete()
    .eq('subject_id', input.subjectId)
    .eq('class_node_id', input.classNodeId);
  if (error) return { error: error.message };
  return {};
}

/** Un chapitre nécessite une matière ET un trimestre déjà existants (section 1.8). */
export async function createChapter(input: {
  subjectId: string;
  termId: string;
  title: string;
}): Promise<MutationResult> {
  const title = input.title.trim();
  if (!input.subjectId) return { error: 'La matière est requise.' };
  if (!input.termId) return { error: 'Le trimestre est requis.' };
  if (!title) return { error: 'Le titre du chapitre est requis.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('chapters')
    .insert({ subject_id: input.subjectId, term_id: input.termId, title });
  if (error) return { error: error.message };
  return {};
}

export async function createTerm(input: {
  countryId: string;
  name: string;
  schoolYear: string;
  startDate: string;
  endDate: string;
}): Promise<MutationResult> {
  const name = input.name.trim();
  const schoolYear = input.schoolYear.trim();
  if (!input.countryId) return { error: 'Le pays est requis.' };
  if (!name) return { error: 'Le nom du trimestre est requis.' };
  if (!schoolYear) return { error: "L'année scolaire est requise." };
  if (!input.startDate || !input.endDate) return { error: 'Les dates de début et de fin sont requises.' };

  const supabase = await createClient();
  const { error } = await supabase.from('terms').insert({
    country_id: input.countryId,
    name,
    school_year: schoolYear,
    start_date: input.startDate,
    end_date: input.endDate,
  });
  if (error) return { error: error.message };
  return {};
}

export async function updateTerm(input: {
  id: string;
  name: string;
  schoolYear: string;
  startDate: string;
  endDate: string;
}): Promise<MutationResult> {
  const name = input.name.trim();
  const schoolYear = input.schoolYear.trim();
  if (!name) return { error: 'Le nom du trimestre est requis.' };
  if (!schoolYear) return { error: "L'année scolaire est requise." };
  if (!input.startDate || !input.endDate) return { error: 'Les dates de début et de fin sont requises.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('terms')
    .update({ name, school_year: schoolYear, start_date: input.startDate, end_date: input.endDate })
    .eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}

/** Déblocage anticipé exceptionnel (section 1.8), scopé par établissement. */
export async function createChapterUnlock(input: {
  chapterId: string;
  establishmentId: string | null;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('chapter_unlocks').insert({
    chapter_id: input.chapterId,
    establishment_id: input.establishmentId,
    admin_id: input.adminId,
  });
  if (error) return { error: error.message };
  return {};
}

export async function deleteChapterUnlock(input: { id: string }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('chapter_unlocks').delete().eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}

export async function createCatalogEntry(input: { subjectId: string; elementType: string }): Promise<MutationResult> {
  const elementType = input.elementType.trim();
  if (!elementType) return { error: "Le type d'élément est requis." };

  const supabase = await createClient();
  const { error } = await supabase
    .from('content_catalog')
    .insert({ subject_id: input.subjectId, element_type: elementType });
  if (error) return { error: error.message };
  return {};
}

export async function setCatalogEntryActive(input: { id: string; isActive: boolean }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('content_catalog').update({ is_active: input.isActive }).eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}

export async function deleteCatalogEntry(input: { id: string; adminId: string | null }): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: before, error: beforeError } = await supabase
    .from('content_catalog')
    .select('*')
    .eq('id', input.id)
    .maybeSingle();
  if (beforeError) return { error: beforeError.message };
  if (!before) return { error: 'Type introuvable.' };

  const trashResult = await trashRows({
    batchId: crypto.randomUUID(),
    tableName: 'content_catalog',
    rows: [before as Record<string, unknown>],
    adminId: input.adminId,
  });
  if (trashResult.error) return trashResult;

  const { error } = await supabase.from('content_catalog').delete().eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}

/** Insère en masse un modèle de catalogue prédéfini (section 16.0) pour une matière. */
export async function loadCatalogTemplate(input: { subjectId: string; elementTypes: string[] }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('content_catalog')
    .insert(input.elementTypes.map((elementType) => ({ subject_id: input.subjectId, element_type: elementType })));
  if (error) return { error: error.message };
  return {};
}

/** Crée la leçon (brouillon de travail) et sa première version, en statut brouillon. */
export async function createLesson(input: {
  chapterId: string;
  title: string;
  bodyText: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const title = input.title.trim();
  if (!input.chapterId) return { error: 'Le chapitre est requis.' };
  if (!title) return { error: 'Le titre de la leçon est requis.' };

  const supabase = await createClient();
  const contentJson = { text: input.bodyText };
  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert({ chapter_id: input.chapterId, title, content_json: contentJson })
    .select('id')
    .single();
  if (error) return { error: error.message };

  const { error: versionError } = await supabase.from('content_versions').insert({
    content_id: lesson.id,
    version_number: 1,
    content_json: contentJson,
    status: 'brouillon',
  });
  if (versionError) return { error: versionError.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'lessons',
    entity_id: lesson.id,
    before_json: null,
    after_json: { title, chapter_id: input.chapterId },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function submitForValidation(input: {
  lessonId: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: version, error: versionError } = await supabase
    .from('content_versions')
    .select('id, version_number, status')
    .eq('content_id', input.lessonId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (versionError) return { error: versionError.message };
  if (!version) return { error: 'Aucune version trouvée pour cette leçon.' };
  if (version.status !== 'brouillon' && version.status !== 'a_corriger') {
    return { error: 'Cette leçon ne peut pas être soumise dans son statut actuel.' };
  }

  const { error: updateError } = await supabase
    .from('content_versions')
    .update({ status: 'en_attente_de_validation' })
    .eq('id', version.id);
  if (updateError) return { error: updateError.message };

  const { data: queueEntry, error: queueError } = await supabase
    .from('validation_queue')
    .insert({
      content_type: 'lesson',
      content_id: input.lessonId,
      status: 'en_attente_de_validation',
      submitted_by: input.adminId,
    })
    .select('id')
    .single();
  if (queueError) return { error: queueError.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'submit',
    entity_type: 'validation_queue',
    entity_id: queueEntry.id,
    before_json: { status: version.status },
    after_json: { status: 'en_attente_de_validation' },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * Cœur des 3 actions de revue (approuver/renvoyer pour correction/rejeter) : même
 * séquence (vérif anti-auto-validation, MAJ content_versions + validation_queue, audit),
 * seul le statut cible et le motif diffèrent.
 */
async function reviewQueueEntry(input: {
  queueId: string;
  adminId: string | null;
  newStatus: ContentStatus;
  rejectionReason: string | null;
  actionType: string;
}): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: entry, error: entryError } = await supabase
    .from('validation_queue')
    .select('id, content_id, content_type, status, submitted_by')
    .eq('id', input.queueId)
    .maybeSingle();
  if (entryError) return { error: entryError.message };
  if (!entry) return { error: 'Entrée introuvable.' };
  if (input.adminId && entry.submitted_by === input.adminId) {
    return { error: 'Vous ne pouvez pas réviser votre propre soumission.' };
  }

  if (entry.content_type === 'lesson') {
    const { data: version, error: versionError } = await supabase
      .from('content_versions')
      .select('id')
      .eq('content_id', entry.content_id)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (versionError) return { error: versionError.message };
    if (version) {
      const { error: updateVersionError } = await supabase
        .from('content_versions')
        .update({ status: input.newStatus })
        .eq('id', version.id);
      if (updateVersionError) return { error: updateVersionError.message };
    }
  }

  const { error: updateQueueError } = await supabase
    .from('validation_queue')
    .update({
      status: input.newStatus,
      reviewed_by: input.adminId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: input.rejectionReason,
    })
    .eq('id', input.queueId);
  if (updateQueueError) return { error: updateQueueError.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: input.actionType,
    entity_type: 'validation_queue',
    entity_id: input.queueId,
    before_json: { status: entry.status },
    after_json: { status: input.newStatus, rejection_reason: input.rejectionReason },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export function approveValidation(input: { queueId: string; adminId: string | null }): Promise<MutationResult> {
  return reviewQueueEntry({
    queueId: input.queueId,
    adminId: input.adminId,
    newStatus: 'publie',
    rejectionReason: null,
    actionType: 'approve',
  });
}

export function requestCorrection(input: {
  queueId: string;
  adminId: string | null;
  reason: string;
}): Promise<MutationResult> {
  if (!input.reason.trim()) return Promise.resolve({ error: 'Le motif est requis.' });
  return reviewQueueEntry({
    queueId: input.queueId,
    adminId: input.adminId,
    newStatus: 'a_corriger',
    rejectionReason: input.reason,
    actionType: 'request_correction',
  });
}

export function rejectDefinitively(input: {
  queueId: string;
  adminId: string | null;
  reason: string;
}): Promise<MutationResult> {
  if (!input.reason.trim()) return Promise.resolve({ error: 'Le motif est requis.' });
  return reviewQueueEntry({
    queueId: input.queueId,
    adminId: input.adminId,
    newStatus: 'rejete',
    rejectionReason: input.reason,
    actionType: 'reject',
  });
}
