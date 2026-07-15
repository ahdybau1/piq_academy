import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ACCOUNTS_ADMIN_ROLES } from '@/lib/accounts/constants';
import { createAccount } from '@/lib/accounts/mutations';

export async function POST(request: Request) {
  const guard = await requireApiRole(ACCOUNTS_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string | null;
    password?: string;
  };
  if (
    typeof body.firstName !== 'string' ||
    typeof body.lastName !== 'string' ||
    typeof body.email !== 'string' ||
    typeof body.password !== 'string'
  ) {
    return NextResponse.json({ error: 'firstName, lastName, email et password sont requis.' }, { status: 400 });
  }

  const result = await createAccount({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone ?? null,
    password: body.password,
    adminUserId: guard.admin.id,
  });
  if (result.error) {
    console.error('[POST /api/accounts]', result.error);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
