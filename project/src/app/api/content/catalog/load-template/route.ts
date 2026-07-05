import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CATALOG_ADMIN_ROLES, CATALOG_TEMPLATES } from '@/lib/content/constants';
import { loadCatalogTemplate } from '@/lib/content/mutations';

export async function POST(request: Request) {
  const guard = await requireApiRole(CATALOG_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { subjectId?: string; templateKey?: string };
  if (typeof body.subjectId !== 'string' || typeof body.templateKey !== 'string') {
    return NextResponse.json({ error: 'subjectId et templateKey sont requis.' }, { status: 400 });
  }

  const elementTypes = CATALOG_TEMPLATES[body.templateKey];
  if (!elementTypes) return NextResponse.json({ error: 'Modèle inconnu.' }, { status: 400 });

  const result = await loadCatalogTemplate({ subjectId: body.subjectId, elementTypes });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
