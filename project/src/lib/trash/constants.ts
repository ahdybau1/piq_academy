import type { UserRole } from '@/lib/types';

/** "L'admin principal" — pouvoir de tout supprimer/restaurer, réservé au Super-admin. */
export const TRASH_ADMIN_ROLES: readonly UserRole[] = ['super_admin'];

/**
 * Ordre de réinsertion à la restauration : une table doit être réinsérée après toutes
 * celles qu'elle référence par clé étrangère (ordre inverse de la suppression).
 * `academic_nodes` est traité à part (auto-référence via parent_id, tri topologique).
 */
export const TABLE_RESTORE_ORDER: readonly string[] = [
  'accounts',
  'profiles',
  'subscription_tiers',
  'access_matrix',
  'subjects',
  'terms',
  'chapters',
  'lessons',
  'content_versions',
  'validation_queue',
  'subject_class_links',
  'official_exams',
  'exam_papers',
  'establishment_papers',
  'forum_threads',
  'forum_posts',
  'whatsapp_communities',
  'content_translation_classes',
  'content_catalog',
];
