import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { SUBSCRIPTION_ADMIN_ROLES } from '@/lib/subscriptions/constants';
import { listSubscriptionTiers } from '@/lib/subscriptions/queries';

export async function GET(request: Request) {
  const guard = await requireApiRole(SUBSCRIPTION_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const countryId = new URL(request.url).searchParams.get('countryId') ?? undefined;
  const tiers = await listSubscriptionTiers(countryId);
  return NextResponse.json(tiers);
}
