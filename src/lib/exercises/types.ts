import type { ContentVersionRow } from '@/lib/content/types';

export type ExerciseType = 'entrainement' | 'evaluation';
export type ExerciseDifficulty = 'simple' | 'intermediaire' | 'approfondissement';
export type ExerciseFormat =
  | 'qcm'
  | 'reponse_courte'
  | 'reponse_numerique'
  | 'redaction'
  | 'reponse_manuscrite'
  | 'texte_a_trous'
  | 'flashcard';

/** Hiérarchie fixe des paliers (section 6.1), distincte des offres tarifaires nommées de `subscription_tiers`. */
export type MinSubscriptionTier = 'gratuit' | 'journalier' | 'hebdomadaire' | 'mensuel' | 'annuel';

/**
 * Rattachement à l'un des 3 niveaux d'indépendance de la section 2.4 : exactement un
 * de `lesson_id`/`chapter_id`/`subject_id` est renseigné selon le niveau choisi.
 */
export interface ExerciseRow {
  id: string;
  lesson_id: string | null;
  chapter_id: string | null;
  subject_id: string | null;
  type: ExerciseType;
  difficulty: ExerciseDifficulty | null;
  format: ExerciseFormat;
  content_json: Record<string, unknown> | null;
  min_subscription_tier: MinSubscriptionTier;
  display_order: number | null;
  /** Type pédagogique applicable (section 16.0) — ex. Exercice d'application. Optionnel. */
  catalog_id: string | null;
  created_at: string | null;
}

/** Exercice enrichi du statut de sa dernière version (même mécanisme que les leçons). */
export interface ExerciseWithStatus extends ExerciseRow {
  latestVersion: ContentVersionRow | null;
  chapterTitle: string | null;
  subjectName: string | null;
}

/** Un seul des trois niveaux de rattachement (section 2.4) est renseigné à la fois. */
export type ExerciseAttachment =
  | { level: 'lesson'; lessonId: string }
  | { level: 'chapter'; chapterId: string }
  | { level: 'subject'; subjectId: string };
