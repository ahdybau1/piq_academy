import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { TRASH_ADMIN_ROLES } from '@/lib/trash/constants';
import { restoreBatch } from '@/lib/trash/mutations';

export async function POST(_request: Request, { params }: { params: Promise<{ batchId: string }> }) {
  const guard = await requireApiRole(TRASH_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { batchId } = await params;
  const result = await restoreBatch({ batchId, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
