import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ESTABLISHMENT_ADMIN_ROLES } from '@/lib/establishments/constants';
import { listEstablishmentPapers } from '@/lib/establishments/queries';
import { createEstablishmentPaper } from '@/lib/establishments/mutations';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ESTABLISHMENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const papers = await listEstablishmentPapers(id);
  return NextResponse.json(papers);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ESTABLISHMENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as {
    classNodeId?: string;
    subjectId?: string;
    year?: number;
    documentUrl?: string | null;
    correctionUrl?: string | null;
  };
  if (typeof body.classNodeId !== 'string' || typeof body.subjectId !== 'string' || typeof body.year !== 'number') {
    return NextResponse.json({ error: 'classNodeId, subjectId et year sont requis.' }, { status: 400 });
  }

  const result = await createEstablishmentPaper({
    establishmentId: id,
    classNodeId: body.classNodeId,
    subjectId: body.subjectId,
    year: body.year,
    documentUrl: body.documentUrl ?? null,
    correctionUrl: body.correctionUrl ?? null,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
