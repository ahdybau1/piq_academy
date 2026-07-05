import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ACADEMIC_ADMIN_ROLES } from '@/lib/academic/constants';
import { updateNode, deleteNode } from '@/lib/academic/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACADEMIC_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { name?: string };
  if (typeof body.name !== 'string') {
    return NextResponse.json({ error: 'name est requis.' }, { status: 400 });
  }

  const result = await updateNode({ id, name: body.name });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACADEMIC_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const cascade = new URL(request.url).searchParams.get('cascade') === 'true';

  const result = await deleteNode({ id, cascade, adminRole: guard.admin.role, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
