import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { listSubjectClassLinks } from '@/lib/content/queries';
import { addSubjectClassLink, removeSubjectClassLink } from '@/lib/content/mutations';

export async function GET(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const subjectId = new URL(request.url).searchParams.get('subjectId');
  if (!subjectId) return NextResponse.json({ error: 'subjectId est requis.' }, { status: 400 });

  const links = await listSubjectClassLinks(subjectId);
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { subjectId?: string; classNodeId?: string };
  if (typeof body.subjectId !== 'string' || typeof body.classNodeId !== 'string') {
    return NextResponse.json({ error: 'subjectId et classNodeId sont requis.' }, { status: 400 });
  }

  const result = await addSubjectClassLink({ subjectId: body.subjectId, classNodeId: body.classNodeId, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { subjectId?: string; classNodeId?: string };
  if (typeof body.subjectId !== 'string' || typeof body.classNodeId !== 'string') {
    return NextResponse.json({ error: 'subjectId et classNodeId sont requis.' }, { status: 400 });
  }

  const result = await removeSubjectClassLink({ subjectId: body.subjectId, classNodeId: body.classNodeId, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
