import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { SUBSCRIPTION_ADMIN_ROLES } from '@/lib/subscriptions/constants';
import { deleteSubscriptionTier } from '@/lib/subscriptions/mutations';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(SUBSCRIPTION_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const result = await deleteSubscriptionTier({ id, adminId: guard.admin.id });
  if (result.error) {
    console.error('[DELETE /api/subscriptions/tiers/[id]]', result.error);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
