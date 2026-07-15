import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { listValidationQueue } from '@/lib/content/queries';

export async function GET(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? undefined;
  const countryId = url.searchParams.get('countryId') ?? undefined;
  const items = await listValidationQueue(status, countryId);
  return NextResponse.json(items);
}
