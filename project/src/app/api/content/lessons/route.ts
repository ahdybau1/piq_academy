import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { listLessons } from '@/lib/content/queries';
import { createLesson } from '@/lib/content/mutations';

export async function GET(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const chapterId = new URL(request.url).searchParams.get('chapterId');
  if (!chapterId) return NextResponse.json({ error: 'chapterId est requis.' }, { status: 400 });

  const lessons = await listLessons(chapterId);
  return NextResponse.json(lessons);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as {
    chapterId?: string;
    title?: string;
    contentJson?: Record<string, unknown>;
    catalogId?: string | null;
  };
  if (typeof body.chapterId !== 'string' || typeof body.title !== 'string' || typeof body.contentJson !== 'object' || body.contentJson === null) {
    return NextResponse.json({ error: 'chapterId, title et contentJson sont requis.' }, { status: 400 });
  }

  const result = await createLesson({
    chapterId: body.chapterId,
    title: body.title,
    contentJson: body.contentJson,
    catalogId: body.catalogId ?? null,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
