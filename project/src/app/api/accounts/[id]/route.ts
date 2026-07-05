import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ACCOUNTS_ADMIN_ROLES } from '@/lib/accounts/constants';
import { getAccountDetail } from '@/lib/accounts/queries';
import { updateAccount, deleteOrAnonymizeAccount } from '@/lib/accounts/mutations';
import { ROLE_CONFIGS } from '@/lib/roles-config';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACCOUNTS_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const detail = await getAccountDetail(id, { includeFinancials: ROLE_CONFIGS[guard.admin.role].canViewFinancials });
  if (!detail) return NextResponse.json({ error: 'Compte introuvable.' }, { status: 404 });
  return NextResponse.json(detail);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACCOUNTS_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    email?: string;
  };
  if (typeof body.firstName !== 'string' || typeof body.lastName !== 'string') {
    return NextResponse.json({ error: 'firstName et lastName sont requis.' }, { status: 400 });
  }

  const result = await updateAccount({
    id,
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone ?? null,
    email: body.email,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACCOUNTS_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const result = await deleteOrAnonymizeAccount({ id, adminUserId: guard.admin.id });
  if (result.error) {
    console.error('[DELETE /api/accounts/[id]]', result.error);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
