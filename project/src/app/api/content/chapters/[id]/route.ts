import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { updateChapter } from '@/lib/content/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { title?: string; introduction?: string; termId?: string };
  if (typeof body.title !== 'string' || typeof body.termId !== 'string') {
    return NextResponse.json({ error: 'title et termId sont requis.' }, { status: 400 });
  }

  const result = await updateChapter({ id, title: body.title, introduction: body.introduction, termId: body.termId });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
