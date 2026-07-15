import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { updateTerm } from '@/lib/content/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as {
    name?: string;
    schoolYear?: string;
    startDate?: string;
    endDate?: string;
  };
  if (
    typeof body.name !== 'string' ||
    typeof body.schoolYear !== 'string' ||
    typeof body.startDate !== 'string' ||
    typeof body.endDate !== 'string'
  ) {
    return NextResponse.json({ error: 'name, schoolYear, startDate et endDate sont requis.' }, { status: 400 });
  }

  const result = await updateTerm({
    id,
    name: body.name,
    schoolYear: body.schoolYear,
    startDate: body.startDate,
    endDate: body.endDate,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
