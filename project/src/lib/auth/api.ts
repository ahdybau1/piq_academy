import 'server-only';
import { NextResponse } from 'next/server';
import { getCurrentAdmin, type CurrentAdmin } from './current-admin';
import type { UserRole } from '@/lib/types';

/**
 * Garde d'autorisation pour les Route Handlers (app/api/**).
 * Contrairement à requireRole() (utilisé dans les Server Components), ceci ne
 * redirige jamais — l'API renvoie une réponse JSON 401/403 explicite, comme
 * n'importe quel endpoint public. C'est la seule frontière que le frontend
 * (composants client) traverse jamais vers les données.
 */
export async function requireApiRole(
  allowed: readonly UserRole[]
): Promise<{ admin: CurrentAdmin } | { response: NextResponse }> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return { response: NextResponse.json({ error: 'Non authentifié.' }, { status: 401 }) };
  }
  if (!allowed.includes(admin.role)) {
    return { response: NextResponse.json({ error: "Rôle non autorisé pour cette action." }, { status: 403 }) };
  }
  return { admin };
}
