import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CATALOG_ADMIN_ROLES } from '@/lib/content/constants';
import { duplicateCatalogToSubject } from '@/lib/content/mutations';

export async function POST(request: Request) {
  const guard = await requireApiRole(CATALOG_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { sourceSubjectId?: string; targetSubjectId?: string };
  if (typeof body.sourceSubjectId !== 'string' || typeof body.targetSubjectId !== 'string') {
    return NextResponse.json({ error: 'sourceSubjectId et targetSubjectId sont requis.' }, { status: 400 });
  }

  const result = await duplicateCatalogToSubject({
    sourceSubjectId: body.sourceSubjectId,
    targetSubjectId: body.targetSubjectId,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
