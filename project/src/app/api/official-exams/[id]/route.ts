import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { OFFICIAL_EXAM_ADMIN_ROLES } from '@/lib/official-exams/constants';
import { updateOfficialExam, deleteOfficialExam } from '@/lib/official-exams/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { classNodeId?: string; name?: string; examDate?: string | null };
  if (typeof body.classNodeId !== 'string' || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'classNodeId et name sont requis.' }, { status: 400 });
  }

  const result = await updateOfficialExam({
    id,
    classNodeId: body.classNodeId,
    name: body.name,
    examDate: body.examDate ?? null,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const cascade = new URL(request.url).searchParams.get('cascade') === 'true';
  const result = await deleteOfficialExam({ id, cascade, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
