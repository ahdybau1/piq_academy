import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { OFFICIAL_EXAM_ADMIN_ROLES } from '@/lib/official-exams/constants';
import { listOfficialExams } from '@/lib/official-exams/queries';
import { createOfficialExam } from '@/lib/official-exams/mutations';

export async function GET(request: Request) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const countryId = new URL(request.url).searchParams.get('countryId') ?? undefined;
  const exams = await listOfficialExams(countryId);
  return NextResponse.json(exams);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { countryId?: string; classNodeId?: string; name?: string; examDate?: string | null };
  if (typeof body.countryId !== 'string' || typeof body.classNodeId !== 'string' || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'countryId, classNodeId et name sont requis.' }, { status: 400 });
  }

  const result = await createOfficialExam({
    countryId: body.countryId,
    classNodeId: body.classNodeId,
    name: body.name,
    examDate: body.examDate ?? null,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
