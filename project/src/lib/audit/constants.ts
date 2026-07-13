import type { UserRole } from '@/lib/types';

/**
 * Section 13.5 : "réservé exclusivement au Super-admin" — le journal d'audit est le
 * mécanisme qui garantit qu'aucune suppression faite par un autre administrateur ne lui
 * échappe ; y donner accès à d'autres rôles casserait cette garantie.
 */
export const AUDIT_ADMIN_ROLES: readonly UserRole[] = ['super_admin'];

export const ACTION_TYPE_LABELS: Record<string, string> = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  activate: 'Activation',
  deactivate: 'Désactivation',
  submit: 'Soumission',
  approve: 'Approbation',
  request_correction: 'Demande de correction',
  reject: 'Rejet',
  restore: 'Restauration',
  purge: 'Purge définitive',
  move: 'Déplacement',
};

export const ENTITY_TYPE_LABELS: Record<string, string> = {
  subjects: 'Matière',
  chapters: 'Chapitre',
  lessons: 'Leçon',
  exercises: 'Exercice',
  content_catalog: 'Catalogue pédagogique',
  official_exams: 'Examen officiel',
  exam_type_classes: 'Classe habilitée à un examen',
  exam_papers: "Épreuve d'examen officiel",
  exam_paper_shared_exams: "Partage d'épreuve entre examens",
  establishments: 'Établissement',
  establishment_papers: "Épreuve d'établissement",
  media_library: 'Média',
  validation_queue: 'File de validation',
  subject_class_links: 'Lien matière-classe',
  trash_items: 'Corbeille',
  academic_nodes: "Nœud de l'arbre académique",
  country_settings: 'Paramètres pays',
  terms: 'Trimestre',
};
