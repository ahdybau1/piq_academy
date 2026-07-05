import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { requestCorrection } from '@/lib/content/mutations';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { reason?: string };
  if (typeof body.reason !== 'string') {
    return NextResponse.json({ error: 'reason est requis.' }, { status: 400 });
  }

  const result = await requestCorrection({ queueId: id, adminId: guard.admin.id, reason: body.reason });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
