import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { trashRows } from '@/lib/trash/mutations';
import { ESTABLISHMENT_PAPER_MAX_SIZE_BYTES } from './constants';

export interface MutationResult {
  error?: string;
}

export interface UploadResult {
  error?: string;
  url?: string;
}

const ESTABLISHMENT_PAPERS_BUCKET = 'establishment-papers';

/** Section 4.1 : création réservée aux administrateurs, pas de délégation aux enseignants. */
export async function createEstablishment(input: {
  countryId: string;
  name: string;
  city: string | null;
  adminId: string | null;
}): Promise<MutationResult> {
  const name = input.name.trim();
  if (!input.countryId) return { error: 'Le pays est requis.' };
  if (!name) return { error: "Le nom de l'établissement est requis." };

  const supabase = await createClient();
  const { data: establishment, error } = await supabase
    .from('establishments')
    .insert({ country_id: input.countryId, name, city: input.city?.trim() || null })
    .select('id')
    .single();
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'establishments',
    entity_id: establishment.id,
    before_json: null,
    after_json: { name, city: input.city },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function updateEstablishment(input: {
  id: string;
  name: string;
  city: string | null;
  isActive: boolean;
  adminId: string | null;
}): Promise<MutationResult> {
  const name = input.name.trim();
  if (!name) return { error: "Le nom de l'établissement est requis." };

  const supabase = await createClient();
  const { error } = await supabase
    .from('establishments')
    .update({ name, city: input.city?.trim() || null, is_active: input.isActive })
    .eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'update',
    entity_type: 'establishments',
    entity_id: input.id,
    before_json: null,
    after_json: { name, city: input.city, is_active: input.isActive },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * Un établissement sans épreuve n'a aucune valeur (section 4 — logique métier confirmée) :
 * on ne bloque donc jamais la création d'une épreuve, au contraire on encourage l'admin à
 * en ajouter une dès la création de l'établissement (porté par l'UI, pas cette fonction).
 */
export async function createEstablishmentPaper(input: {
  establishmentId: string;
  classNodeId: string;
  subjectId: string;
  year: number;
  documentUrl: string | null;
  correctionUrl: string | null;
  adminId: string | null;
}): Promise<MutationResult> {
  if (!input.classNodeId) return { error: 'La classe est requise.' };
  if (!input.subjectId) return { error: 'La matière est requise.' };
  if (!input.year) return { error: "L'année est requise." };

  const supabase = await createClient();
  const { data: paper, error } = await supabase
    .from('establishment_papers')
    .insert({
      establishment_id: input.establishmentId,
      class_node_id: input.classNodeId,
      subject_id: input.subjectId,
      year: input.year,
      document_url: input.documentUrl,
      correction_url: input.correctionUrl,
      status: 'brouillon',
    })
    .select('id')
    .single();
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'establishment_papers',
    entity_id: paper.id,
    before_json: null,
    after_json: { class_node_id: input.classNodeId, subject_id: input.subjectId, year: input.year },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function updateEstablishmentPaper(input: {
  id: string;
  classNodeId: string;
  subjectId: string;
  year: number;
  documentUrl: string | null;
  correctionUrl: string | null;
  adminId: string | null;
}): Promise<MutationResult> {
  if (!input.classNodeId) return { error: 'La classe est requise.' };
  if (!input.subjectId) return { error: 'La matière est requise.' };
  if (!input.year) return { error: "L'année est requise." };

  const supabase = await createClient();
  const { error } = await supabase
    .from('establishment_papers')
    .update({
      class_node_id: input.classNodeId,
      subject_id: input.subjectId,
      year: input.year,
      document_url: input.documentUrl,
      correction_url: input.correctionUrl,
    })
    .eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'update',
    entity_type: 'establishment_papers',
    entity_id: input.id,
    before_json: null,
    after_json: { class_node_id: input.classNodeId, subject_id: input.subjectId, year: input.year },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function deleteEstablishmentPaper(input: { id: string; adminId: string | null }): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: before, error: beforeError } = await supabase
    .from('establishment_papers')
    .select('*')
    .eq('id', input.id)
    .maybeSingle();
  if (beforeError) return { error: beforeError.message };
  if (!before) return { error: 'Épreuve introuvable.' };

  const trashResult = await trashRows({
    batchId: crypto.randomUUID(),
    tableName: 'establishment_papers',
    rows: [before as Record<string, unknown>],
    adminId: input.adminId,
  });
  if (trashResult.error) return trashResult;

  const { error } = await supabase.from('establishment_papers').delete().eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'delete',
    entity_type: 'establishment_papers',
    entity_id: input.id,
    before_json: before,
    after_json: null,
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/** Soumission au workflow de validation (section 4.2), même mécanisme que les leçons/exercices. */
export async function submitEstablishmentPaperForValidation(input: {
  paperId: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: paper, error: paperError } = await supabase
    .from('establishment_papers')
    .select('id, status')
    .eq('id', input.paperId)
    .maybeSingle();
  if (paperError) return { error: paperError.message };
  if (!paper) return { error: 'Épreuve introuvable.' };
  if (paper.status !== 'brouillon' && paper.status !== 'a_corriger') {
    return { error: 'Cette épreuve ne peut pas être soumise dans son statut actuel.' };
  }

  const { error: updateError } = await supabase
    .from('establishment_papers')
    .update({ status: 'en_attente_de_validation' })
    .eq('id', input.paperId);
  if (updateError) return { error: updateError.message };

  const { data: queueEntry, error: queueError } = await supabase
    .from('validation_queue')
    .insert({
      content_type: 'establishment_paper',
      content_id: input.paperId,
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
    before_json: { status: paper.status },
    after_json: { status: 'en_attente_de_validation' },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/** Upload direct d'un PDF (sujet ou correction) dans le bucket dédié — aucune ligne DB créée ici. */
export async function uploadEstablishmentDocument(input: { file: File }): Promise<UploadResult> {
  const { file } = input;
  if (file.type !== 'application/pdf') return { error: 'Seuls les fichiers PDF sont acceptés.' };
  if (file.size > ESTABLISHMENT_PAPER_MAX_SIZE_BYTES) {
    return { error: `Fichier trop volumineux (max ${Math.round(ESTABLISHMENT_PAPER_MAX_SIZE_BYTES / (1024 * 1024))} Mo).` };
  }

  const supabase = await createClient();
  const path = `${crypto.randomUUID()}.pdf`;

  const { error: uploadError } = await supabase.storage.from(ESTABLISHMENT_PAPERS_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    console.error('[uploadEstablishmentDocument] Supabase Storage upload failed:', uploadError);
    return { error: `Échec de l'upload Storage : ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(ESTABLISHMENT_PAPERS_BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}
