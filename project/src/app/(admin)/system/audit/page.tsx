import { requireRole } from '@/lib/auth/current-admin';
import { AUDIT_ADMIN_ROLES } from '@/lib/audit/constants';
import { listAuditLog } from '@/lib/audit/queries';
import { AuditLogPageView } from '@/components/system/audit-page';

export default async function AuditPage() {
  // Garde de rôle côté serveur : redirige vers /unauthorized si le rôle n'est pas autorisé.
  // Ceci est une protection de confort — la vraie barrière est le contrôle de rôle dans l'API
  // (le journal d'audit est lu via le client admin, hors RLS, donc cette double garde compte).
  await requireRole([...AUDIT_ADMIN_ROLES]);

  const entries = await listAuditLog();

  return <AuditLogPageView initialEntries={entries} />;
}
