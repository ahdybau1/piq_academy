import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { ENTITY_TYPE_LABELS } from './constants';
import type { AuditLogItem } from './types';

/**
 * Lecture via le client admin (service_role) : le journal d'audit doit rester consultable
 * par le Super-admin même pour des actions faites par des admins dont le périmètre RLS ne
 * couvrirait pas la ligne d'origine (ex. action d'un admin_pays sur un autre pays).
 * Limité aux 500 entrées les plus récentes — le filtrage se fait côté client sur ce lot.
 */
export async function listAuditLog(): Promise<AuditLogItem[]> {
  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from('audit_log')
    .select('id, admin_user_id, action_type, entity_type, entity_id, before_json, after_json, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return [];

  const adminIds = Array.from(new Set(rows.map((r) => r.admin_user_id).filter((v): v is string => !!v)));
  let adminById = new Map<string, { email: string; role: string }>();
  if (adminIds.length > 0) {
    const { data: admins, error: adminsError } = await admin.from('admin_users').select('id, email, role').in('id', adminIds);
    if (adminsError) throw new Error(adminsError.message);
    adminById = new Map((admins ?? []).map((a) => [a.id, { email: a.email, role: a.role }]));
  }

  return rows.map((r) => {
    const adminInfo = r.admin_user_id ? adminById.get(r.admin_user_id) : undefined;
    const data = (r.after_json ?? r.before_json) as Record<string, unknown> | null;
    const candidate = data ? (data.title ?? data.name ?? data.element_type ?? data.email) : undefined;
    const entityLabel = typeof candidate === 'string' ? candidate : ENTITY_TYPE_LABELS[r.entity_type] ?? r.entity_type;
    return {
      ...r,
      adminEmail: adminInfo?.email ?? null,
      adminRole: adminInfo?.role ?? null,
      entityLabel,
    };
  });
}
