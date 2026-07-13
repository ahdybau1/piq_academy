import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { updateLesson, deleteLesson } from '@/lib/content/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { title?: string; contentJson?: Record<string, unknown>; catalogId?: string | null };
  if (typeof body.title !== 'string' || typeof body.contentJson !== 'object' || body.contentJson === null) {
    return NextResponse.json({ error: 'title et contentJson sont requis.' }, { status: 400 });
  }

  const result = await updateLesson({
    id,
    title: body.title,
    contentJson: body.contentJson,
    catalogId: body.catalogId ?? null,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const cascade = new URL(request.url).searchParams.get('cascade') === 'true';
  const result = await deleteLesson({ id, cascade, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
