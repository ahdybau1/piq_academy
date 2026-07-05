import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CATALOG_ADMIN_ROLES } from '@/lib/content/constants';
import { listCatalog } from '@/lib/content/queries';
import { createCatalogEntry } from '@/lib/content/mutations';

export async function GET(request: Request) {
  const guard = await requireApiRole(CATALOG_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const subjectId = new URL(request.url).searchParams.get('subjectId');
  if (!subjectId) return NextResponse.json({ error: 'subjectId est requis.' }, { status: 400 });

  const entries = await listCatalog(subjectId);
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(CATALOG_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { subjectId?: string; elementType?: string };
  if (typeof body.subjectId !== 'string' || typeof body.elementType !== 'string') {
    return NextResponse.json({ error: 'subjectId et elementType sont requis.' }, { status: 400 });
  }

  const result = await createCatalogEntry({ subjectId: body.subjectId, elementType: body.elementType });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
