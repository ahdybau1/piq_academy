import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ACCOUNTS_ADMIN_ROLES } from '@/lib/accounts/constants';
import { resetPassword } from '@/lib/accounts/mutations';
import { getAccountDetail } from '@/lib/accounts/queries';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACCOUNTS_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const account = await getAccountDetail(id, { includeFinancials: false });
  if (!account) return NextResponse.json({ error: 'Compte introuvable.' }, { status: 404 });

  const result = await resetPassword({ email: account.email });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
