import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { OFFICIAL_EXAM_ADMIN_ROLES } from '@/lib/official-exams/constants';
import { listExamTypeClasses } from '@/lib/official-exams/queries';
import { addExamTypeClass, removeExamTypeClass } from '@/lib/official-exams/mutations';

export async function GET(request: Request) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const examTypeId = new URL(request.url).searchParams.get('examTypeId');
  if (!examTypeId) return NextResponse.json({ error: 'examTypeId est requis.' }, { status: 400 });

  const links = await listExamTypeClasses(examTypeId);
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { examTypeId?: string; classNodeId?: string };
  if (typeof body.examTypeId !== 'string' || typeof body.classNodeId !== 'string') {
    return NextResponse.json({ error: 'examTypeId et classNodeId sont requis.' }, { status: 400 });
  }

  const result = await addExamTypeClass({ examTypeId: body.examTypeId, classNodeId: body.classNodeId, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { examTypeId?: string; classNodeId?: string };
  if (typeof body.examTypeId !== 'string' || typeof body.classNodeId !== 'string') {
    return NextResponse.json({ error: 'examTypeId et classNodeId sont requis.' }, { status: 400 });
  }

  const result = await removeExamTypeClass({ examTypeId: body.examTypeId, classNodeId: body.classNodeId, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
