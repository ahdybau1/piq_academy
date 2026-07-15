import type { ExerciseAttachment, ExerciseWithStatus, ExerciseDifficulty, ExerciseFormat, ExerciseType, MinSubscriptionTier } from './types';

/**
 * Seul point de contact entre le frontend (composants client) et les données.
 * Aucun appel Supabase ici — uniquement des requêtes vers l'API interne (app/api/exercises/**).
 */

interface ApiResult {
  error?: string;
}

async function request(url: string, init?: RequestInit): Promise<ApiResult> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: data?.error ?? `Erreur inattendue (${res.status}).` };
  }
  return {};
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export async function fetchExercises(attachment: ExerciseAttachment): Promise<ExerciseWithStatus[]> {
  const params = new URLSearchParams();
  if (attachment.level === 'lesson') params.set('lessonId', attachment.lessonId);
  else if (attachment.level === 'chapter') params.set('chapterId', attachment.chapterId);
  else params.set('subjectId', attachment.subjectId);

  const res = await fetch(`/api/exercises?${params.toString()}`);
  if (!res.ok) throw new Error('Impossible de charger les exercices.');
  return res.json();
}

export function createExercise(input: {
  attachment: ExerciseAttachment;
  type: ExerciseType;
  difficulty: ExerciseDifficulty | null;
  format: ExerciseFormat;
  minSubscriptionTier: MinSubscriptionTier;
  contentJson: Record<string, unknown>;
  catalogId: string | null;
}) {
  return request('/api/exercises', jsonInit('POST', input));
}

export function updateExercise(input: {
  id: string;
  type: ExerciseType;
  difficulty: ExerciseDifficulty | null;
  format: ExerciseFormat;
  minSubscriptionTier: MinSubscriptionTier;
  contentJson: Record<string, unknown>;
  catalogId: string | null;
}) {
  return request(`/api/exercises/${input.id}`, jsonInit('PATCH', input));
}

export function moveExercise(input: { id: string; direction: 'up' | 'down'; attachment: ExerciseAttachment }) {
  return request(`/api/exercises/${input.id}/move`, jsonInit('POST', input));
}

export function deleteExercise(input: { id: string }) {
  return request(`/api/exercises/${input.id}`, { method: 'DELETE' });
}

export function submitExerciseForValidation(input: { exerciseId: string }) {
  return request(`/api/exercises/${input.exerciseId}/submit`, { method: 'POST' });
}
