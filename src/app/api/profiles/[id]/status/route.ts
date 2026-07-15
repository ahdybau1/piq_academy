import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ACCOUNTS_ADMIN_ROLES } from '@/lib/accounts/constants';
import { setProfileStatus } from '@/lib/accounts/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACCOUNTS_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { status?: 'actif' | 'archivé' };
  if (body.status !== 'actif' && body.status !== 'archivé') {
    return NextResponse.json({ error: "status doit être 'actif' ou 'archivé'." }, { status: 400 });
  }

  const result = await setProfileStatus({ id, status: body.status });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
