import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';

export interface CurrentAdmin {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Lit l'admin actuellement authentifié (table admin_users).
 * Ne redirige jamais — retourne null si non authentifié ou si le compte
 * n'a pas de ligne admin_users (ex: compte élève qui n'a pas sa place ici).
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, email, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminUser) return null;

  return adminUser as CurrentAdmin;
});

/** À utiliser dans chaque layout/page qui exige une session admin valide. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/login');
  return admin;
}

/**
 * À utiliser en plus de requireAdmin() dans chaque page dont l'accès est
 * limité à certains rôles. Ceci est une protection de confort (UX) —
 * la vraie barrière de sécurité reste la policy RLS sur la table sous-jacente.
 */
export async function requireRole(allowed: UserRole[]): Promise<CurrentAdmin> {
  const admin = await requireAdmin();
  if (!allowed.includes(admin.role)) redirect('/unauthorized');
  return admin;
}
