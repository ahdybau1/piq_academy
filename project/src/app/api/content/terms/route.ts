import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { listTerms } from '@/lib/content/queries';
import { createTerm } from '@/lib/content/mutations';

export async function GET(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const countryId = new URL(request.url).searchParams.get('countryId') ?? undefined;
  const terms = await listTerms(countryId);
  return NextResponse.json(terms);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as {
    countryId?: string;
    name?: string;
    schoolYear?: string;
    startDate?: string;
    endDate?: string;
  };
  if (
    typeof body.countryId !== 'string' ||
    typeof body.name !== 'string' ||
    typeof body.schoolYear !== 'string' ||
    typeof body.startDate !== 'string' ||
    typeof body.endDate !== 'string'
  ) {
    return NextResponse.json({ error: 'countryId, name, schoolYear, startDate et endDate sont requis.' }, { status: 400 });
  }

  const result = await createTerm({
    countryId: body.countryId,
    name: body.name,
    schoolYear: body.schoolYear,
    startDate: body.startDate,
    endDate: body.endDate,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
