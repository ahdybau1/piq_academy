import type { ExerciseDifficulty, ExerciseFormat, ExerciseType, MinSubscriptionTier } from './types';

export const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: 'entrainement', label: 'Entraînement' },
  { value: 'evaluation', label: 'Évaluation' },
];

export const EXERCISE_DIFFICULTIES: { value: ExerciseDifficulty; label: string }[] = [
  { value: 'simple', label: 'Simple' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'approfondissement', label: 'Approfondissement' },
];

export const EXERCISE_FORMATS: { value: ExerciseFormat; label: string }[] = [
  { value: 'qcm', label: 'QCM' },
  { value: 'reponse_courte', label: 'Réponse courte' },
  { value: 'reponse_numerique', label: 'Réponse numérique' },
  { value: 'redaction', label: 'Rédaction' },
  { value: 'reponse_manuscrite', label: 'Réponse manuscrite' },
  { value: 'texte_a_trous', label: 'Texte à trous' },
  { value: 'flashcard', label: 'Flashcard' },
];

/** Hiérarchie figée du cahier des charges, section 6.1 — jamais réordonnée ni étendue en dur ailleurs. */
export const MIN_SUBSCRIPTION_TIERS: { value: MinSubscriptionTier; label: string }[] = [
  { value: 'gratuit', label: 'Gratuit' },
  { value: 'journalier', label: 'Journalier' },
  { value: 'hebdomadaire', label: 'Hebdomadaire' },
  { value: 'mensuel', label: 'Mensuel' },
  { value: 'annuel', label: 'Annuel' },
];
