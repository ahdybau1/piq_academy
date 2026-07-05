import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ACCOUNTS_ADMIN_ROLES } from '@/lib/accounts/constants';
import { transferProfile } from '@/lib/accounts/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACCOUNTS_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { newAccountId?: string };
  if (typeof body.newAccountId !== 'string' || !body.newAccountId) {
    return NextResponse.json({ error: 'newAccountId est requis.' }, { status: 400 });
  }

  const result = await transferProfile({ id, newAccountId: body.newAccountId });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
