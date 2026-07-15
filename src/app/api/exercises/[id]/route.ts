import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { updateExercise, deleteExercise } from '@/lib/exercises/mutations';
import type { ExerciseDifficulty, ExerciseFormat, ExerciseType, MinSubscriptionTier } from '@/lib/exercises/types';

interface UpdateExerciseBody {
  type?: ExerciseType;
  difficulty?: ExerciseDifficulty | null;
  format?: ExerciseFormat;
  minSubscriptionTier?: MinSubscriptionTier;
  contentJson?: Record<string, unknown>;
  catalogId?: string | null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as UpdateExerciseBody;
  if (
    typeof body.type !== 'string' ||
    typeof body.format !== 'string' ||
    typeof body.minSubscriptionTier !== 'string' ||
    typeof body.contentJson !== 'object' ||
    body.contentJson === null
  ) {
    return NextResponse.json({ error: 'type, format, minSubscriptionTier et contentJson sont requis.' }, { status: 400 });
  }

  const result = await updateExercise({
    id,
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

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const result = await deleteExercise({ id, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
