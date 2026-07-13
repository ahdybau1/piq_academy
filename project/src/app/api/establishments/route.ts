import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ESTABLISHMENT_ADMIN_ROLES } from '@/lib/establishments/constants';
import { listEstablishments } from '@/lib/establishments/queries';
import { createEstablishment } from '@/lib/establishments/mutations';

export async function GET(request: Request) {
  const guard = await requireApiRole(ESTABLISHMENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const countryId = new URL(request.url).searchParams.get('countryId') ?? undefined;
  const establishments = await listEstablishments(countryId);
  return NextResponse.json(establishments);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(ESTABLISHMENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { countryId?: string; name?: string; city?: string | null };
  if (typeof body.countryId !== 'string' || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'countryId et name sont requis.' }, { status: 400 });
  }

  const result = await createEstablishment({
    countryId: body.countryId,
    name: body.name,
    city: body.city ?? null,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
