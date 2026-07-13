import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ACADEMIC_ADMIN_ROLES } from '@/lib/academic/constants';
import { mergeNode } from '@/lib/academic/mutations';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACADEMIC_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { targetId?: string };
  if (typeof body.targetId !== 'string' || !body.targetId) {
    return NextResponse.json({ error: 'targetId est requis.' }, { status: 400 });
  }

  const result = await mergeNode({ sourceId: id, targetId: body.targetId, adminRole: guard.admin.role, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
