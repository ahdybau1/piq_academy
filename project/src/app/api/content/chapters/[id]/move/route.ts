import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { moveChapter } from '@/lib/content/mutations';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { direction?: 'up' | 'down'; subjectId?: string };
  if (body.direction !== 'up' && body.direction !== 'down') {
    return NextResponse.json({ error: 'direction doit être "up" ou "down".' }, { status: 400 });
  }
  if (typeof body.subjectId !== 'string') {
    return NextResponse.json({ error: 'subjectId est requis.' }, { status: 400 });
  }

  const result = await moveChapter({ id, direction: body.direction, subjectId: body.subjectId });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
