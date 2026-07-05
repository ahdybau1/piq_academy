import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { SUBSCRIPTION_ADMIN_ROLES } from '@/lib/subscriptions/constants';
import { setSubscriptionTierActive } from '@/lib/subscriptions/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(SUBSCRIPTION_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { isActive?: boolean };
  if (typeof body.isActive !== 'boolean') {
    return NextResponse.json({ error: 'isActive est requis.' }, { status: 400 });
  }

  const result = await setSubscriptionTierActive({ id, isActive: body.isActive, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
