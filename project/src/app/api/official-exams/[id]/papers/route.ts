import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { OFFICIAL_EXAM_ADMIN_ROLES } from '@/lib/official-exams/constants';
import { listExamPapers } from '@/lib/official-exams/queries';
import { createExamPaper } from '@/lib/official-exams/mutations';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const papers = await listExamPapers(id);
  return NextResponse.json(papers);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as {
    subjectId?: string;
    year?: number;
    documentUrl?: string | null;
    correctionUrl?: string | null;
    correctionVisible?: boolean;
  };
  if (typeof body.subjectId !== 'string' || typeof body.year !== 'number') {
    return NextResponse.json({ error: 'subjectId et year sont requis.' }, { status: 400 });
  }

  const result = await createExamPaper({
    examId: id,
    subjectId: body.subjectId,
    year: body.year,
    documentUrl: body.documentUrl ?? null,
    correctionUrl: body.correctionUrl ?? null,
    correctionVisible: body.correctionVisible ?? false,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
