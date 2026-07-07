import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { listExercisesByLesson, listExercisesByChapter, listExercisesBySubject } from '@/lib/exercises/queries';
import { createExercise } from '@/lib/exercises/mutations';
import type { ExerciseAttachment, ExerciseDifficulty, ExerciseFormat, ExerciseType, MinSubscriptionTier } from '@/lib/exercises/types';

export async function GET(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const params = new URL(request.url).searchParams;
  const lessonId = params.get('lessonId');
  const chapterId = params.get('chapterId');
  const subjectId = params.get('subjectId');

  if (lessonId) return NextResponse.json(await listExercisesByLesson(lessonId));
  if (chapterId) return NextResponse.json(await listExercisesByChapter(chapterId));
  if (subjectId) return NextResponse.json(await listExercisesBySubject(subjectId));
  return NextResponse.json({ error: 'lessonId, chapterId ou subjectId est requis.' }, { status: 400 });
}

interface CreateExerciseBody {
  attachment?: ExerciseAttachment;
  type?: ExerciseType;
  difficulty?: ExerciseDifficulty | null;
  format?: ExerciseFormat;
  minSubscriptionTier?: MinSubscriptionTier;
  contentJson?: Record<string, unknown>;
  catalogId?: string | null;
}

export async function POST(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as CreateExerciseBody;
  if (
    !body.attachment ||
    typeof body.type !== 'string' ||
    typeof body.format !== 'string' ||
    typeof body.minSubscriptionTier !== 'string' ||
    typeof body.contentJson !== 'object' ||
    body.contentJson === null
  ) {
    return NextResponse.json({ error: 'attachment, type, format, minSubscriptionTier et contentJson sont requis.' }, { status: 400 });
  }

  const result = await createExercise({
    attachment: body.attachment,
    type: body.type,
    difficulty: body.difficulty ?? null,
    format: body.format,
    minSubscriptionTier: body.minSubscriptionTier,
    contentJson: body.contentJson,
    catalogId: body.catalogId ?? null,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
