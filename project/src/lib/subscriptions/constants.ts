import type { UserRole } from '@/lib/types';

/**
 * Configuration tarifaire/paliers : "Accès à cette configuration : Super-admin par défaut,
 * délégable explicitement" (section 6.1). Pas de délégation implémentée pour l'instant.
 */
export const SUBSCRIPTION_ADMIN_ROLES: readonly UserRole[] = ['super_admin'];
