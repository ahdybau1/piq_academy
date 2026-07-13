import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ESTABLISHMENT_ADMIN_ROLES } from '@/lib/establishments/constants';
import { listEstablishmentTeachers } from '@/lib/establishments/queries';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ESTABLISHMENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const teachers = await listEstablishmentTeachers(id);
  return NextResponse.json(teachers);
}
