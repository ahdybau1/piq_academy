import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ACADEMIC_ADMIN_ROLES } from '@/lib/academic/constants';
import { getCountrySettings } from '@/lib/academic/queries';
import { upsertCountrySettings } from '@/lib/academic/mutations';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACADEMIC_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const settings = await getCountrySettings(id);
  return NextResponse.json(settings);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ACADEMIC_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as {
    officialLanguages?: string[];
    currency?: string | null;
    schoolYearStartDate?: string | null;
    schoolYearEndDate?: string | null;
  };

  const result = await upsertCountrySettings({
    countryId: id,
    officialLanguages: body.officialLanguages ?? [],
    currency: body.currency ?? null,
    schoolYearStartDate: body.schoolYearStartDate ?? null,
    schoolYearEndDate: body.schoolYearEndDate ?? null,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
