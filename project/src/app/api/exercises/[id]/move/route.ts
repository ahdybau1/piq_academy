import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { moveExercise } from '@/lib/exercises/mutations';
import type { ExerciseAttachment } from '@/lib/exercises/types';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { direction?: 'up' | 'down'; attachment?: ExerciseAttachment };
  if ((body.direction !== 'up' && body.direction !== 'down') || !body.attachment) {
    return NextResponse.json({ error: 'direction et attachment sont requis.' }, { status: 400 });
  }

  const result = await moveExercise({ id, direction: body.direction, attachment: body.attachment });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
