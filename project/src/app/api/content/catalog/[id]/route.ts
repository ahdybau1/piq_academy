import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CATALOG_ADMIN_ROLES } from '@/lib/content/constants';
import { setCatalogEntryActive, deleteCatalogEntry } from '@/lib/content/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CATALOG_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { isActive?: boolean };
  if (typeof body.isActive !== 'boolean') {
    return NextResponse.json({ error: 'isActive est requis.' }, { status: 400 });
  }

  const result = await setCatalogEntryActive({ id, isActive: body.isActive });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CATALOG_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const result = await deleteCatalogEntry({ id, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
