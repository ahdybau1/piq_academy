import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { moveLesson } from '@/lib/content/mutations';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { direction?: 'up' | 'down'; chapterId?: string };
  if ((body.direction !== 'up' && body.direction !== 'down') || typeof body.chapterId !== 'string') {
    return NextResponse.json({ error: 'direction et chapterId sont requis.' }, { status: 400 });
  }

  const result = await moveLesson({ id, direction: body.direction, chapterId: body.chapterId });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
