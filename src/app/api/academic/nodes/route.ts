import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ACADEMIC_ADMIN_ROLES } from '@/lib/academic/constants';
import { createNode } from '@/lib/academic/mutations';
import { listAcademicNodes } from '@/lib/academic/queries';
import type { AcademicNodeType } from '@/lib/academic/types';

export async function GET(request: Request) {
  const guard = await requireApiRole(ACADEMIC_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const countryId = new URL(request.url).searchParams.get('countryId') ?? undefined;
  const nodes = await listAcademicNodes(countryId);
  return NextResponse.json(nodes);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(ACADEMIC_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { nodeType?: AcademicNodeType; name?: string; parentId?: string | null };
  if (!body.nodeType || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'nodeType et name sont requis.' }, { status: 400 });
  }

  const result = await createNode({ nodeType: body.nodeType, name: body.name, parentId: body.parentId ?? null, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
