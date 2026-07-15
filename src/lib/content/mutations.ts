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
  adminId: string | null;
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

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'subjects',
    entity_id: subject.id,
    before_json: null,
    after_json: { name, node_id: input.nodeId },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/** Modification d'une matière existante (section 2.1) — seul le nom est renommable ici ; le rattachement aux classes se gère via les liens (add/removeSubjectClassLink). */
export async function updateSubject(input: { id: string; name: string; adminId: string | null }): Promise<MutationResult> {
  const name = input.name.trim();
  if (!name) return { error: 'Le nom de la matière est requis.' };

  const supabase = await createClient();
  const { error } = await supabase.from('subjects').update({ name }).eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'update',
    entity_type: 'subjects',
    entity_id: input.id,
    before_json: null,
    after_json: { name },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function addSubjectClassLink(input: { subjectId: string; classNodeId: string; adminId: string | null }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('subject_class_links')
    .insert({ subject_id: input.subjectId, class_node_id: input.classNodeId });
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'subject_class_links',
    entity_id: input.subjectId,
    before_json: null,
    after_json: { class_node_id: input.classNodeId },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * Retire une classe du partage (section 1.5 : "si une classe est retirée d'un groupe, ses
 * élèves perdent l'accès"). L'application de cette règle côté lecture élève est hors
 * périmètre — l'Application Élève n'existe pas encore dans ce dépôt.
 */
export async function removeSubjectClassLink(input: { subjectId: string; classNodeId: string; adminId: string | null }): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('subject_class_links')
    .delete()
    .eq('subject_id', input.subjectId)
    .eq('class_node_id', input.classNodeId);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'delete',
    entity_type: 'subject_class_links',
    entity_id: input.subjectId,
    before_json: { class_node_id: input.classNodeId },
    after_json: null,
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * Supprime une matière : bloque par défaut si des chapitres/classes liées/types de
 * catalogue/exercices indépendants en dépendent encore (section 1.7), cascade en option
 * explicite via `cascadeDeleteChapter`/`cascadeDeleteLesson` (définies plus bas, function
 * declarations hissées — l'ordre dans le fichier n'a pas d'incidence).
 */
export async function deleteSubject(input: { id: string; cascade: boolean; adminId: string | null }): Promise<MutationResult> {
  const admin = createAdminClient();

  const [chapterRes, linkRes, catalogRes, exerciseRes] = await Promise.all([
    admin.from('chapters').select('id', { count: 'exact', head: true }).eq('subject_id', input.id),
    admin.from('subject_class_links').select('subject_id', { count: 'exact', head: true }).eq('subject_id', input.id),
    admin.from('content_catalog').select('id', { count: 'exact', head: true }).eq('subject_id', input.id),
    admin.from('exercises').select('id', { count: 'exact', head: true }).eq('subject_id', input.id).is('chapter_id', null),
  ]);
  if (chapterRes.error) return { error: chapterRes.error.message };
  if (linkRes.error) return { error: linkRes.error.message };
  if (catalogRes.error) return { error: catalogRes.error.message };
  if (exerciseRes.error) return { error: exerciseRes.error.message };

  const chapterCount = chapterRes.count ?? 0;
  const linkCount = linkRes.count ?? 0;
  const catalogCount = catalogRes.count ?? 0;
  const exerciseCount = exerciseRes.count ?? 0;

  if (!input.cascade && (chapterCount > 0 || linkCount > 0 || catalogCount > 0 || exerciseCount > 0)) {
    const parts: string[] = [];
    if (chapterCount > 0) parts.push(`${chapterCount} chapitre(s)`);
    if (exerciseCount > 0) parts.push(`${exerciseCount} exercice(s) indépendant(s)`);
    if (catalogCount > 0) parts.push(`${catalogCount} type(s) de catalogue`);
    if (linkCount > 0) parts.push(`${linkCount} classe(s) liée(s)`);
    return { error: `Cette matière a ${parts.join(', ')}. Confirmez pour tout supprimer.` };
  }

  const batchId = crypto.randomUUID();

  const { data: chapters, error: chaptersError } = await admin.from('chapters').select('id').eq('subject_id', input.id);
  if (chaptersError) return { error: chaptersError.message };
  for (const chapter of chapters ?? []) {
    const result = await cascadeDeleteChapter({ admin, batchId, chapterId: chapter.id, adminId: input.adminId });
    if (result.error) return result;
  }

  const { data: independentExercises, error: indExError } = await admin
    .from('exercises')
    .select('*')
    .eq('subject_id', input.id)
    .is('chapter_id', null);
  if (indExError) return { error: indExError.message };
  if (independentExercises && independentExercises.length > 0) {
    const trashResult = await trashRows({ batchId, tableName: 'exercises', rows: independentExercises, adminId: input.adminId });
    if (trashResult.error) return trashResult;
    const { error } = await admin.from('exercises').delete().eq('subject_id', input.id).is('chapter_id', null);
    if (error) return { error: error.message };
  }

  const { data: links, error: linksFetchError } = await admin.from('subject_class_links').select('*').eq('subject_id', input.id);
  if (linksFetchError) return { error: linksFetchError.message };
  if (links && links.length > 0) {
    const trashResult = await trashRows({ batchId, tableName: 'subject_class_links', rows: links, adminId: input.adminId });
    if (trashResult.error) return trashResult;
    const { error } = await admin.from('subject_class_links').delete().eq('subject_id', input.id);
    if (error) return { error: error.message };
  }

  const { data: catalogEntries, error: catalogFetchError } = await admin.from('content_catalog').select('*').eq('subject_id', input.id);
  if (catalogFetchError) return { error: catalogFetchError.message };
  if (catalogEntries && catalogEntries.length > 0) {
    const trashResult = await trashRows({ batchId, tableName: 'content_catalog', rows: catalogEntries, adminId: input.adminId });
    if (trashResult.error) return trashResult;
    const { error } = await admin.from('content_catalog').delete().eq('subject_id', input.id);
    if (error) return { error: error.message };
  }

  const { data: subject, error: subjectError } = await admin.from('subjects').select('*').eq('id', input.id).maybeSingle();
  if (subjectError) return { error: subjectError.message };
  if (!subject) return { error: 'Matière introuvable.' };
  const subjectTrash = await trashRows({ batchId, tableName: 'subjects', rows: [subject], adminId: input.adminId });
  if (subjectTrash.error) return subjectTrash;
  const { error } = await admin.from('subjects').delete().eq('id', input.id);
  if (error) return { error: error.message };

  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'delete',
    entity_type: 'subjects',
    entity_id: input.id,
    before_json: subject,
    after_json: null,
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * Un chapitre nécessite une matière ET un trimestre déjà existants (section 1.8).
 * `display_order` est calculé automatiquement (dernier + 1) : l'admin ne le saisit
 * jamais directement, il réordonne ensuite via monter/descendre (`moveChapter`).
 */
export async function createChapter(input: {
  subjectId: string;
  termId: string;
  title: string;
  introduction?: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const title = input.title.trim();
  if (!input.subjectId) return { error: 'La matière est requise.' };
  if (!input.termId) return { error: 'Le trimestre est requis.' };
  if (!title) return { error: 'Le titre du chapitre est requis.' };

  const supabase = await createClient();

  const { data: lastChapter, error: lastError } = await supabase
    .from('chapters')
    .select('display_order')
    .eq('subject_id', input.subjectId)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastError) return { error: lastError.message };
  const nextOrder = (lastChapter?.display_order ?? -1) + 1;

  const { data: chapter, error } = await supabase
    .from('chapters')
    .insert({
      subject_id: input.subjectId,
      term_id: input.termId,
      title,
      introduction: input.introduction?.trim() || null,
      display_order: nextOrder,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'chapters',
    entity_id: chapter.id,
    before_json: null,
    after_json: { title, subject_id: input.subjectId, term_id: input.termId },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/** Modification d'un chapitre existant — le trimestre peut être réassigné (ex. erreur de saisie). */
export async function updateChapter(input: {
  id: string;
  title: string;
  introduction?: string;
  termId: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const title = input.title.trim();
  if (!title) return { error: 'Le titre du chapitre est requis.' };
  if (!input.termId) return { error: 'Le trimestre est requis.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('chapters')
    .update({ title, introduction: input.introduction?.trim() || null, term_id: input.termId })
    .eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'update',
    entity_type: 'chapters',
    entity_id: input.id,
    before_json: null,
    after_json: { title, term_id: input.termId },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * Réordonnancement par échange de position (monter/descendre) : on échange les
 * `display_order` des deux chapitres adjacents plutôt que de renuméroter toute la liste.
 */
export async function moveChapter(input: {
  id: string;
  direction: 'up' | 'down';
  subjectId: string;
}): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: chapters, error } = await supabase
    .from('chapters')
    .select('id, display_order')
    .eq('subject_id', input.subjectId)
    .order('display_order', { ascending: true });
  if (error) return { error: error.message };
  if (!chapters) return { error: 'Chapitre introuvable.' };

  const index = chapters.findIndex((c) => c.id === input.id);
  if (index === -1) return { error: 'Chapitre introuvable.' };
  const swapIndex = input.direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= chapters.length) return {}; // déjà en bout de liste, no-op

  const current = chapters[index];
  const swapWith = chapters[swapIndex];

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from('chapters').update({ display_order: swapWith.display_order }).eq('id', current.id),
    supabase.from('chapters').update({ display_order: current.display_order }).eq('id', swapWith.id),
  ]);
  if (e1) return { error: e1.message };
  if (e2) return { error: e2.message };
  return {};
}

/**
 * Supprime un chapitre et cascade sur ses leçons (elles-mêmes cascadées vers leurs
 * exercices), ses exercices de niveau chapitre et ses déblocages anticipés. Fonction
 * interne réutilisée par `deleteChapter` et `deleteSubject`.
 */
async function cascadeDeleteChapter(input: {
  admin: ReturnType<typeof createAdminClient>;
  batchId: string;
  chapterId: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const { admin, batchId, chapterId, adminId } = input;

  const { data: lessons, error: lessonsError } = await admin.from('lessons').select('id').eq('chapter_id', chapterId);
  if (lessonsError) return { error: lessonsError.message };
  for (const lesson of lessons ?? []) {
    const result = await cascadeDeleteLesson({ admin, batchId, lessonId: lesson.id, adminId });
    if (result.error) return result;
  }

  const { data: exercises, error: exercisesError } = await admin
    .from('exercises')
    .select('*')
    .eq('chapter_id', chapterId)
    .is('lesson_id', null);
  if (exercisesError) return { error: exercisesError.message };
  if (exercises && exercises.length > 0) {
    const trashResult = await trashRows({ batchId, tableName: 'exercises', rows: exercises, adminId });
    if (trashResult.error) return trashResult;
    const { error } = await admin.from('exercises').delete().eq('chapter_id', chapterId).is('lesson_id', null);
    if (error) return { error: error.message };
  }

  // chapter_unlocks n'est pas versionné en corbeille (même précédent que deleteChapterUnlock) — simple suppression.
  const { error: unlocksError } = await admin.from('chapter_unlocks').delete().eq('chapter_id', chapterId);
  if (unlocksError) return { error: unlocksError.message };

  const { data: chapter, error: chapterError } = await admin.from('chapters').select('*').eq('id', chapterId).maybeSingle();
  if (chapterError) return { error: chapterError.message };
  if (chapter) {
    const trashResult = await trashRows({ batchId, tableName: 'chapters', rows: [chapter], adminId });
    if (trashResult.error) return trashResult;
    const { error } = await admin.from('chapters').delete().eq('id', chapterId);
    if (error) return { error: error.message };
  }

  return {};
}

export async function deleteChapter(input: { id: string; cascade: boolean; adminId: string | null }): Promise<MutationResult> {
  const admin = createAdminClient();

  const [lessonRes, exerciseRes, unlockRes] = await Promise.all([
    admin.from('lessons').select('id', { count: 'exact', head: true }).eq('chapter_id', input.id),
    admin.from('exercises').select('id', { count: 'exact', head: true }).eq('chapter_id', input.id).is('lesson_id', null),
    admin.from('chapter_unlocks').select('id', { count: 'exact', head: true }).eq('chapter_id', input.id),
  ]);
  if (lessonRes.error) return { error: lessonRes.error.message };
  if (exerciseRes.error) return { error: exerciseRes.error.message };
  if (unlockRes.error) return { error: unlockRes.error.message };

  const lessonCount = lessonRes.count ?? 0;
  const exerciseCount = exerciseRes.count ?? 0;
  const unlockCount = unlockRes.count ?? 0;

  if (!input.cascade && (lessonCount > 0 || exerciseCount > 0 || unlockCount > 0)) {
    const parts: string[] = [];
    if (lessonCount > 0) parts.push(`${lessonCount} leçon(s)`);
    if (exerciseCount > 0) parts.push(`${exerciseCount} exercice(s)`);
    if (unlockCount > 0) parts.push(`${unlockCount} déblocage(s) anticipé(s)`);
    return { error: `Ce chapitre a ${parts.join(', ')}. Confirmez pour tout supprimer.` };
  }

  const batchId = crypto.randomUUID();
  const result = await cascadeDeleteChapter({ admin, batchId, chapterId: input.id, adminId: input.adminId });
  if (result.error) return result;

  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'delete',
    entity_type: 'chapters',
    entity_id: input.id,
    before_json: null,
    after_json: null,
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function createTerm(input: {
  countryId: string;
  name: string;
  schoolYear: string;
  startDate: string;
  endDate: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const name = input.name.trim();
  const schoolYear = input.schoolYear.trim();
  if (!input.countryId) return { error: 'Le pays est requis.' };
  if (!name) return { error: 'Le nom du trimestre est requis.' };
  if (!schoolYear) return { error: "L'année scolaire est requise." };
  if (!input.startDate || !input.endDate) return { error: 'Les dates de début et de fin sont requises.' };

  const supabase = await createClient();
  const { data: term, error } = await supabase
    .from('terms')
    .insert({
      country_id: input.countryId,
      name,
      school_year: schoolYear,
      start_date: input.startDate,
      end_date: input.endDate,
    })
    .select('id')
    .single();
  if (error) {
    if (error.code === '23505') return { error: `Un trimestre « ${name} » existe déjà pour l'année ${schoolYear} dans ce pays.` };
    return { error: error.message };
  }

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'terms',
    entity_id: term.id,
    before_json: null,
    after_json: { name, school_year: schoolYear, start_date: input.startDate, end_date: input.endDate },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function updateTerm(input: {
  id: string;
  name: string;
  schoolYear: string;
  startDate: string;
  endDate: string;
  adminId: string | null;
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
  if (error) {
    if (error.code === '23505') return { error: `Un trimestre « ${name} » existe déjà pour l'année ${schoolYear} dans ce pays.` };
    return { error: error.message };
  }

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'update',
    entity_type: 'terms',
    entity_id: input.id,
    before_json: null,
    after_json: { name, school_year: schoolYear, start_date: input.startDate, end_date: input.endDate },
  });
  if (auditError) return { error: auditError.message };

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

export async function createCatalogEntry(input: {
  subjectId: string;
  elementType: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const elementType = input.elementType.trim();
  if (!elementType) return { error: "Le type d'élément est requis." };

  const supabase = await createClient();
  const { data: entry, error } = await supabase
    .from('content_catalog')
    .insert({ subject_id: input.subjectId, element_type: elementType })
    .select('id')
    .single();
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'content_catalog',
    entity_id: entry.id,
    before_json: null,
    after_json: { subject_id: input.subjectId, element_type: elementType },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/** Renomme un type d'élément de catalogue (section 16.0 : "créer/modifier un type d'élément"). */
export async function updateCatalogEntry(input: { id: string; elementType: string; adminId: string | null }): Promise<MutationResult> {
  const elementType = input.elementType.trim();
  if (!elementType) return { error: "Le nom du type d'élément est requis." };

  const supabase = await createClient();
  const { error } = await supabase.from('content_catalog').update({ element_type: elementType }).eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'update',
    entity_type: 'content_catalog',
    entity_id: input.id,
    before_json: null,
    after_json: { element_type: elementType },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

export async function setCatalogEntryActive(input: {
  id: string;
  isActive: boolean;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('content_catalog').update({ is_active: input.isActive }).eq('id', input.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: input.isActive ? 'activate' : 'deactivate',
    entity_type: 'content_catalog',
    entity_id: input.id,
    before_json: null,
    after_json: { is_active: input.isActive },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * Une entrée de catalogue encore référencée par des leçons/exercices ne peut pas être
 * supprimée sans confirmation explicite (`cascade`) — même logique de dépendances que
 * l'arbre académique (`deleteNode`). En cascade, les leçons/exercices concernés sont
 * détachés (catalog_id remis à null) : on ne supprime jamais du contenu réel pour
 * pouvoir supprimer une simple étiquette.
 */
export async function deleteCatalogEntry(input: {
  id: string;
  cascade: boolean;
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: before, error: beforeError } = await supabase
    .from('content_catalog')
    .select('*')
    .eq('id', input.id)
    .maybeSingle();
  if (beforeError) return { error: beforeError.message };
  if (!before) return { error: 'Type introuvable.' };

  const [lessonRes, exerciseRes] = await Promise.all([
    admin.from('lessons').select('id', { count: 'exact', head: true }).eq('catalog_id', input.id),
    admin.from('exercises').select('id', { count: 'exact', head: true }).eq('catalog_id', input.id),
  ]);
  if (lessonRes.error) return { error: lessonRes.error.message };
  if (exerciseRes.error) return { error: exerciseRes.error.message };
  const lessonCount = lessonRes.count ?? 0;
  const exerciseCount = exerciseRes.count ?? 0;

  if (!input.cascade && (lessonCount > 0 || exerciseCount > 0)) {
    const parts: string[] = [];
    if (lessonCount > 0) parts.push(`${lessonCount} leçon(s)`);
    if (exerciseCount > 0) parts.push(`${exerciseCount} exercice(s)`);
    return {
      error: `Ce type est encore utilisé par ${parts.join(' et ')}. Confirmez pour les détacher automatiquement, ou retirez d'abord le tag manuellement.`,
    };
  }

  if (input.cascade) {
    if (lessonCount > 0) {
      const { error } = await admin.from('lessons').update({ catalog_id: null }).eq('catalog_id', input.id);
      if (error) return { error: error.message };
    }
    if (exerciseCount > 0) {
      const { error } = await admin.from('exercises').update({ catalog_id: null }).eq('catalog_id', input.id);
      if (error) return { error: error.message };
    }
  }

  const trashResult = await trashRows({
    batchId: crypto.randomUUID(),
    tableName: 'content_catalog',
    rows: [before as Record<string, unknown>],
    adminId: input.adminId,
  });
  if (trashResult.error) return trashResult;

  const { error } = await supabase.from('content_catalog').delete().eq('id', input.id);
  if (error) return { error: error.message };

  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'delete',
    entity_type: 'content_catalog',
    entity_id: input.id,
    before_json: before,
    after_json: null,
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/** Insère en masse un modèle de catalogue prédéfini (section 16.0) pour une matière. */
export async function loadCatalogTemplate(input: {
  subjectId: string;
  elementTypes: string[];
  adminId: string | null;
}): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('content_catalog')
    .insert(input.elementTypes.map((elementType) => ({ subject_id: input.subjectId, element_type: elementType })));
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'content_catalog',
    entity_id: input.subjectId,
    before_json: null,
    after_json: { template_element_types: input.elementTypes },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * « Dupliquer vers une matière » (remplace le catalogue figé de `CATALOG_TEMPLATES`
 * comme unique point de départ) : copie les entrées actives d'une matière source vers
 * une matière cible, en ignorant les types déjà présents côté cible pour éviter les
 * doublons.
 */
export async function duplicateCatalogToSubject(input: {
  sourceSubjectId: string;
  targetSubjectId: string;
  adminId: string | null;
}): Promise<MutationResult> {
  if (input.sourceSubjectId === input.targetSubjectId) {
    return { error: 'La matière cible doit être différente de la matière source.' };
  }

  const supabase = await createClient();

  const { data: sourceEntries, error: sourceError } = await supabase
    .from('content_catalog')
    .select('element_type')
    .eq('subject_id', input.sourceSubjectId);
  if (sourceError) return { error: sourceError.message };
  if (!sourceEntries || sourceEntries.length === 0) return { error: 'La matière source ne contient aucun type à dupliquer.' };

  const { data: targetEntries, error: targetError } = await supabase
    .from('content_catalog')
    .select('element_type')
    .eq('subject_id', input.targetSubjectId);
  if (targetError) return { error: targetError.message };

  const existing = new Set((targetEntries ?? []).map((e) => e.element_type));
  const toInsert = Array.from(new Set(sourceEntries.map((e) => e.element_type))).filter((t) => !existing.has(t));
  if (toInsert.length === 0) return { error: 'La matière cible possède déjà tous ces types.' };

  const { error } = await supabase
    .from('content_catalog')
    .insert(toInsert.map((elementType) => ({ subject_id: input.targetSubjectId, element_type: elementType })));
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'create',
    entity_type: 'content_catalog',
    entity_id: input.targetSubjectId,
    before_json: { source_subject_id: input.sourceSubjectId },
    after_json: { duplicated_element_types: toInsert },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/** Crée la leçon (brouillon de travail) et sa première version, en statut brouillon. */
export async function createLesson(input: {
  chapterId: string;
  title: string;
  contentJson: Record<string, unknown>;
  catalogId: string | null;
  adminId: string | null;
}): Promise<MutationResult> {
  const title = input.title.trim();
  if (!input.chapterId) return { error: 'Le chapitre est requis.' };
  if (!title) return { error: 'Le titre de la leçon est requis.' };

  const supabase = await createClient();
  const contentJson = input.contentJson;

  const { data: lastLesson, error: lastError } = await supabase
    .from('lessons')
    .select('display_order')
    .eq('chapter_id', input.chapterId)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastError) return { error: lastError.message };
  const nextOrder = (lastLesson?.display_order ?? -1) + 1;

  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert({ chapter_id: input.chapterId, title, content_json: contentJson, catalog_id: input.catalogId, display_order: nextOrder })
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

/**
 * Modifie une leçon existante (titre + contenu riche). Section 2.6 (versioning) :
 * si la dernière version est déjà « publié », l'édition crée une NOUVELLE version en
 * brouillon (repasse par le workflow de validation) — la version publiée visible des
 * élèves n'est jamais écrasée silencieusement. Sinon (brouillon/à corriger/en attente),
 * on modifie la version de travail en place : ce n'est pas encore du contenu visible.
 */
export async function updateLesson(input: {
  id: string;
  title: string;
  contentJson: Record<string, unknown>;
  catalogId: string | null;
  adminId: string | null;
}): Promise<MutationResult> {
  const title = input.title.trim();
  if (!title) return { error: 'Le titre de la leçon est requis.' };

  const supabase = await createClient();

  const { error: lessonError } = await supabase
    .from('lessons')
    .update({ title, content_json: input.contentJson, catalog_id: input.catalogId, updated_at: new Date().toISOString() })
    .eq('id', input.id);
  if (lessonError) return { error: lessonError.message };

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
    entity_type: 'lessons',
    entity_id: input.id,
    before_json: null,
    after_json: { title },
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/**
 * Supprime une leçon et cascade sur ses exercices rattachés + son historique de versions
 * (section 1.7 : blocage par défaut, cascade en option explicite). Fonction interne
 * réutilisée par `deleteLesson`, `cascadeDeleteChapter` et `deleteSubject`.
 */
async function cascadeDeleteLesson(input: {
  admin: ReturnType<typeof createAdminClient>;
  batchId: string;
  lessonId: string;
  adminId: string | null;
}): Promise<MutationResult> {
  const { admin, batchId, lessonId, adminId } = input;

  const { data: exercises, error: exercisesError } = await admin.from('exercises').select('*').eq('lesson_id', lessonId);
  if (exercisesError) return { error: exercisesError.message };
  if (exercises && exercises.length > 0) {
    const trashResult = await trashRows({ batchId, tableName: 'exercises', rows: exercises, adminId });
    if (trashResult.error) return trashResult;
    const { error } = await admin.from('exercises').delete().eq('lesson_id', lessonId);
    if (error) return { error: error.message };
  }

  const { data: versions, error: versionsError } = await admin.from('content_versions').select('*').eq('content_id', lessonId);
  if (versionsError) return { error: versionsError.message };
  if (versions && versions.length > 0) {
    const trashResult = await trashRows({ batchId, tableName: 'content_versions', rows: versions, adminId });
    if (trashResult.error) return trashResult;
    const { error } = await admin.from('content_versions').delete().eq('content_id', lessonId);
    if (error) return { error: error.message };
  }

  const { data: lesson, error: lessonError } = await admin.from('lessons').select('*').eq('id', lessonId).maybeSingle();
  if (lessonError) return { error: lessonError.message };
  if (lesson) {
    const trashResult = await trashRows({ batchId, tableName: 'lessons', rows: [lesson], adminId });
    if (trashResult.error) return trashResult;
    const { error } = await admin.from('lessons').delete().eq('id', lessonId);
    if (error) return { error: error.message };
  }

  return {};
}

export async function deleteLesson(input: { id: string; cascade: boolean; adminId: string | null }): Promise<MutationResult> {
  const admin = createAdminClient();

  const { count: exerciseCount, error: countError } = await admin
    .from('exercises')
    .select('id', { count: 'exact', head: true })
    .eq('lesson_id', input.id);
  if (countError) return { error: countError.message };

  if (!input.cascade && (exerciseCount ?? 0) > 0) {
    return { error: `Cette leçon a ${exerciseCount} exercice(s) rattaché(s). Confirmez pour tout supprimer.` };
  }

  const batchId = crypto.randomUUID();
  const result = await cascadeDeleteLesson({ admin, batchId, lessonId: input.id, adminId: input.adminId });
  if (result.error) return result;

  const { error: auditError } = await admin.from('audit_log').insert({
    admin_user_id: input.adminId,
    action_type: 'delete',
    entity_type: 'lessons',
    entity_id: input.id,
    before_json: null,
    after_json: null,
  });
  if (auditError) return { error: auditError.message };

  return {};
}

/** Réordonnancement par échange de position, même mécanisme que `moveChapter`/`moveExercise`. */
export async function moveLesson(input: { id: string; direction: 'up' | 'down'; chapterId: string }): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('id, display_order')
    .eq('chapter_id', input.chapterId)
    .order('display_order', { ascending: true });
  if (error) return { error: error.message };
  if (!lessons) return { error: 'Leçon introuvable.' };

  const index = lessons.findIndex((l) => l.id === input.id);
  if (index === -1) return { error: 'Leçon introuvable.' };
  const swapIndex = input.direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= lessons.length) return {}; // déjà en bout de liste, no-op

  const current = lessons[index];
  const swapWith = lessons[swapIndex];

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from('lessons').update({ display_order: swapWith.display_order }).eq('id', current.id),
    supabase.from('lessons').update({ display_order: current.display_order }).eq('id', swapWith.id),
  ]);
  if (e1) return { error: e1.message };
  if (e2) return { error: e2.message };
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

  if (entry.content_type === 'lesson' || entry.content_type === 'exercise') {
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

  if (entry.content_type === 'establishment_paper') {
    // Pas de content_versions ici : une épreuve d'établissement n'a pas de contenu JSON
    // structuré à versionner (juste des documents), le statut vit directement sur la ligne.
    const { error: updatePaperError } = await supabase
      .from('establishment_papers')
      .update({ status: input.newStatus })
      .eq('id', entry.content_id);
    if (updatePaperError) return { error: updatePaperError.message };
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
