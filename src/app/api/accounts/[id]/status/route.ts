import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ACCOUNTS_ADMIN_ROLES } from '@/lib/accounts/constants';
import { setAccountStatus } from '@/lib/accounts/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACCOUNTS_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { status?: 'actif' | 'suspendu' };
  if (body.status !== 'actif' && body.status !== 'suspendu') {
    return NextResponse.json({ error: "status doit être 'actif' ou 'suspendu'." }, { status: 400 });
  }

  const result = await setAccountStatus({ id, status: body.status, adminUserId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
