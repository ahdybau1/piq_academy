import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { OFFICIAL_EXAM_ADMIN_ROLES } from '@/lib/official-exams/constants';
import { listExamPaperSharedExams } from '@/lib/official-exams/queries';
import { addExamPaperSharedExam, removeExamPaperSharedExam } from '@/lib/official-exams/mutations';

export async function GET(request: Request) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const examPaperId = new URL(request.url).searchParams.get('examPaperId');
  if (!examPaperId) return NextResponse.json({ error: 'examPaperId est requis.' }, { status: 400 });

  const links = await listExamPaperSharedExams(examPaperId);
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { examPaperId?: string; examTypeId?: string };
  if (typeof body.examPaperId !== 'string' || typeof body.examTypeId !== 'string') {
    return NextResponse.json({ error: 'examPaperId et examTypeId sont requis.' }, { status: 400 });
  }

  const result = await addExamPaperSharedExam({ examPaperId: body.examPaperId, examTypeId: body.examTypeId, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { examPaperId?: string; examTypeId?: string };
  if (typeof body.examPaperId !== 'string' || typeof body.examTypeId !== 'string') {
    return NextResponse.json({ error: 'examPaperId et examTypeId sont requis.' }, { status: 400 });
  }

  const result = await removeExamPaperSharedExam({ examPaperId: body.examPaperId, examTypeId: body.examTypeId, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
