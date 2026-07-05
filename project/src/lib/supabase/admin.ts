import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Client `service_role`, réservé aux appels Auth Admin (bannir/débannir,
 * supprimer un utilisateur Auth). Ne jamais l'utiliser pour lire/écrire des
 * tables métier — celles-ci passent par le client RLS (`lib/supabase/server.ts`),
 * seule vraie barrière d'autorisation sur les données.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
