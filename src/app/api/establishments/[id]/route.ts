import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { ESTABLISHMENT_ADMIN_ROLES } from '@/lib/establishments/constants';
import { updateEstablishment } from '@/lib/establishments/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(ESTABLISHMENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { name?: string; city?: string | null; isActive?: boolean };
  if (typeof body.name !== 'string' || typeof body.isActive !== 'boolean') {
    return NextResponse.json({ error: 'name et isActive sont requis.' }, { status: 400 });
  }

  const result = await updateEstablishment({
    id,
    name: body.name,
    city: body.city ?? null,
    isActive: body.isActive,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
