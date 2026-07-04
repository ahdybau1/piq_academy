import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ACADEMIC_ADMIN_ROLES } from '@/lib/academic/constants';
import { moveNode } from '@/lib/academic/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACADEMIC_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { newParentId?: string | null };

  const result = await moveNode({ id, newParentId: body.newParentId ?? null });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
