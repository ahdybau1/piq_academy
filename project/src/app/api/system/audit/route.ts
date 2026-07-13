import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { AUDIT_ADMIN_ROLES } from '@/lib/audit/constants';
import { listAuditLog } from '@/lib/audit/queries';

export async function GET() {
  const guard = await requireApiRole(AUDIT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const entries = await listAuditLog();
  return NextResponse.json(entries);
}
