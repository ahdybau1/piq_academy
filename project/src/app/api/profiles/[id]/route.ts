import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ACCOUNTS_ADMIN_ROLES } from '@/lib/accounts/constants';
import { updateProfile, deleteOrAnonymizeProfile } from '@/lib/accounts/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACCOUNTS_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { classNodeId?: string; schoolYear?: string };
  if (typeof body.classNodeId !== 'string') {
    return NextResponse.json({ error: 'classNodeId est requis.' }, { status: 400 });
  }

  const result = await updateProfile({ id, classNodeId: body.classNodeId, schoolYear: body.schoolYear ?? '' });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACCOUNTS_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const result = await deleteOrAnonymizeProfile({ id, adminUserId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
