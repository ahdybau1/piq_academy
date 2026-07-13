import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CATALOG_ADMIN_ROLES } from '@/lib/content/constants';
import { setCatalogEntryActive, updateCatalogEntry, deleteCatalogEntry } from '@/lib/content/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CATALOG_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { isActive?: boolean; elementType?: string };

  if (typeof body.elementType === 'string') {
    const result = await updateCatalogEntry({ id, elementType: body.elementType, adminId: guard.admin.id });
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (typeof body.isActive === 'boolean') {
    const result = await setCatalogEntryActive({ id, isActive: body.isActive, adminId: guard.admin.id });
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'isActive ou elementType est requis.' }, { status: 400 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CATALOG_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const cascade = new URL(request.url).searchParams.get('cascade') === 'true';
  const result = await deleteCatalogEntry({ id, cascade, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
