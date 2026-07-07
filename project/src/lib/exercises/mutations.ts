import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { trashRows } from '@/lib/trash/mutations';
import type { ExerciseAttachment, ExerciseDifficulty, ExerciseFormat, ExerciseType, MinSubscriptionTier } from './types';

export interface MutationResult {
  error?: string;
}

function attachmentColumns(attachment: ExerciseAttachment) {
  if (attachment.level === 'lesson') return { lesson_id: attachment.lessonId, chapter_id: null, subject_id: null };
  if (attachment.level === 'chapter') return { lesson_id: null, chapter_id: attachment.chapterId, subject_id: null };
  return { lesson_id: null, chapter_id: null, subject_id: attachment.subjectId };
}

/** Crée l'exercice (brouillon de travail) et sa première version, en statut brouillon. */
export async function createExercise(input: {
  attachment: ExerciseAttachment;
  type: ExerciseType;
  difficulty: ExerciseDifficulty | null;
  format: ExerciseFormat;
  minSubscriptionTier: MinSubscriptionTier;
  contentJson: Record<string, unknown>;
  catalogId: string | null;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: lastExercise, error: lastError } = await supabase
    .from('exercises')
    .select('display_order')
    .match(attachmentColumns(input.attachment))
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastError) return { error: lastError.message };
  const nextOrder = (lastExercise?.display_order ?? -1) + 1;

  const { data: exercise, error } = await supabase
    .from('exercises')
    .insert({
      ...attachmentColumns(input.attachment),
      type: input.type,
      difficulty: input.difficulty,
      format: input.format,
      min_subscription_tier: input.minSubscriptionTier,
      content_json: input.contentJson,
      catalog_id: input.catalogId,
      display_order: nextOrder,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };

  const { error: versionError } = await supabase.from('content_versions').insert({
    content_id: exercise.id,
    version_number: 1,
    content_json: input.contentJson,
    status: 'brouillon',
  });
  if (versionError) return { error: versionError.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'exercises',
    entity_id: exercise.id,
    before_json: null,
    after_json: { type: input.type, format: input.format, ...attachmentColumns(input.attachment) },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * Modifie un exercice existant. Même règle de versioning que les leçons (section 2.6) :
 * si la dernière version est déjà « publié », l'édition crée une NOUVELLE version en
 * brouillon plutôt que d'écraser silencieusement le contenu déjà visible des élèves.
 */
export async function updateExercise(input: {
  id: string;
  type: ExerciseType;
  difficulty: ExerciseDifficulty | null;
  format: ExerciseFormat;
  minSubscriptionTier: MinSubscriptionTier;
  contentJson: Record<string, unknown>;
  catalogId: string | null;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();

  const { error: exerciseError } = await supabase
    .from('exercises')
    .update({
      type: input.type,
      difficulty: input.difficulty,
      format: input.format,
      min_subscription_tier: input.minSubscriptionTier,
      content_json: input.contentJson,
      catalog_id: input.catalogId,
    })
    .eq('id', input.id);
  if (exerciseError) return { error: exerciseError.message };

  const { data: latestVersion, error: versionFetchError } = await supabase
    .from('content_versions')
    .select('id, version_number, status')
    .eq('content_id', input.id)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (versionFetchError) return { error: versionFetchError.message };

  if (!latestVersion || latestVersion.status === 'publie') {
    const nextVersionNumber = (latestVersion?.version_number ?? 0) + 1;
    const { error: insertError } = await supabase.from('content_versions').insert({
      content_id: input.id,
      version_number: nextVersionNumber,
      content_json: input.contentJson,
      status: 'brouillon',
    });
    if (insertError) return { error: insertError.message };
  } else {
    const { error: updateError } = await supabase
      .from('content_versions')
      .update({ content_json: input.contentJson })
      .eq('id', latestVersion.id);
    if (updateError) return { error: updateError.message };
  }

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'update',
    entity_type: 'exercises',
    entity_id: input.id,
    before_json: null,
    after_json: { type: input.type, format: input.format },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/** Réordonnancement par échange de position, même mécanisme que `moveChapter`. */
export async function moveExercise(input: {
  id: string;
  direction: 'up' | 'down';
  attachment: ExerciseAttachment;
}): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, display_order')
    .match(attachmentColumns(input.attachment))
    .order('display_order', { ascending: true });
  if (error) return { error: error.message };
  if (!exercises) return { error: 'Exercice introuvable.' };

  const index = exercises.findIndex((e) => e.id === input.id);
  if (index === -1) return { error: 'Exercice introuvable.' };
  const swapIndex = input.direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= exercises.length) return {}; // déjà en bout de liste, no-op

  const current = exercises[index];
  const swapWith = exercises[swapIndex];

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from('exercises').update({ display_order: swapWith.display_order }).eq('id', current.id),
    supabase.from('exercises').update({ display_order: current.display_order }).eq('id', swapWith.id),
  ]);
  if (e1) return { error: e1.message };
  if (e2) return { error: e2.message };
  return {};
}

export async function deleteExercise(input: { id: string; adminId: string | null }): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: before, error: beforeError } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', input.id)
    .maybeSingle();
  if (beforeError) return { error: beforeError.message };
  if (!before) return { error: 'Exercice introuvable.' };

  const trashResult = await trashRows({
    batchId: crypto.randomUUID(),
    tableName: 'exercises',
    rows: [before as Record<string, unknown>],
    adminId: input.adminId,
  });
  if (trashResult.error) return trashResult;

  const { error } = await supabase.from('exercises').delete().eq('id', input.id);
  if (error) return { error: error.message };
  return {};
}

export async function submitExerciseForValidation(input: {
  exerciseId: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: version, error: versionError } = await supabase
    .from('content_versions')
    .select('id, version_number, status')
    .eq('content_id', input.exerciseId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (versionError) return { error: versionError.message };
  if (!version) return { error: 'Aucune version trouvée pour cet exercice.' };
  if (version.status !== 'brouillon' && version.status !== 'a_corriger') {
    return { error: 'Cet exercice ne peut pas être soumis dans son statut actuel.' };
  }

  const { error: updateError } = await supabase
    .from('content_versions')
    .update({ status: 'en_attente_de_validation' })
    .eq('id', version.id);
  if (updateError) return { error: updateError.message };

  const { data: queueEntry, error: queueError } = await supabase
    .from('validation_queue')
    .insert({
      content_type: 'exercise',
      content_id: input.exerciseId,
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
