import type { UserRole } from '@/lib/types';

/**
 * Section 4.1 : "Création réservée exclusivement aux administrateurs — aucune délégation
 * aux enseignants". Mêmes rôles que la gestion du contenu pédagogique.
 */
export const ESTABLISHMENT_ADMIN_ROLES: readonly UserRole[] = ['super_admin', 'admin_pays', 'admin_contenu'];

export const ESTABLISHMENT_PAPER_MAX_SIZE_BYTES = 30 * 1024 * 1024;
