import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { listChapters } from '@/lib/content/queries';
import { createChapter } from '@/lib/content/mutations';

export async function GET(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const subjectId = new URL(request.url).searchParams.get('subjectId') ?? undefined;
  const chapters = await listChapters(subjectId);
  return NextResponse.json(chapters);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { subjectId?: string; termId?: string; title?: string; introduction?: string };
  if (typeof body.subjectId !== 'string' || typeof body.termId !== 'string' || typeof body.title !== 'string') {
    return NextResponse.json({ error: 'subjectId, termId et title sont requis.' }, { status: 400 });
  }

  const result = await createChapter({
    subjectId: body.subjectId,
    termId: body.termId,
    title: body.title,
    introduction: body.introduction,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
