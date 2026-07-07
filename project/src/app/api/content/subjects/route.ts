import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { listSubjects } from '@/lib/content/queries';
import { createSubject } from '@/lib/content/mutations';

export async function GET(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const countryId = new URL(request.url).searchParams.get('countryId') ?? undefined;
  const subjects = await listSubjects(countryId);
  return NextResponse.json(subjects);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { name?: string; nodeId?: string; additionalClassNodeIds?: string[] };
  if (typeof body.name !== 'string' || typeof body.nodeId !== 'string') {
    return NextResponse.json({ error: 'name et nodeId sont requis.' }, { status: 400 });
  }

  const result = await createSubject({
    name: body.name,
    nodeId: body.nodeId,
    additionalClassNodeIds: body.additionalClassNodeIds ?? [],
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
