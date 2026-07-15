import type { UserRole } from '@/lib/types';

/** Rôles avec `canManageUsers: true` dans roles-config.ts. */
export const ACCOUNTS_ADMIN_ROLES: readonly UserRole[] = ['super_admin', 'admin_pays'];
