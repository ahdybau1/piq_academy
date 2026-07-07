import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { submitExerciseForValidation } from '@/lib/exercises/mutations';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const result = await submitExerciseForValidation({ exerciseId: id, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
