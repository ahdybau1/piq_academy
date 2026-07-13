import type { AuditLogItem } from './types';

export async function fetchAuditLog(): Promise<AuditLogItem[]> {
  const res = await fetch('/api/system/audit');
  if (!res.ok) throw new Error("Impossible de charger le journal d'audit.");
  return res.json();
}
