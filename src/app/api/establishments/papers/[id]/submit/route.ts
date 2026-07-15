import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ESTABLISHMENT_ADMIN_ROLES } from '@/lib/establishments/constants';
import { submitEstablishmentPaperForValidation } from '@/lib/establishments/mutations';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ESTABLISHMENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const result = await submitEstablishmentPaperForValidation({ paperId: id, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
