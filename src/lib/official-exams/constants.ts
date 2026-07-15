import type { UserRole } from '@/lib/types';

/** Mêmes rôles que la gestion du contenu pédagogique (examens nationaux = contenu pays). */
export const OFFICIAL_EXAM_ADMIN_ROLES: readonly UserRole[] = ['super_admin', 'admin_pays', 'admin_contenu'];

export const EXAM_PAPER_MAX_SIZE_BYTES = 30 * 1024 * 1024;
