import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { listChapterUnlocks } from '@/lib/content/queries';
import { createChapterUnlock } from '@/lib/content/mutations';

export async function GET(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const chapterId = new URL(request.url).searchParams.get('chapterId');
  if (!chapterId) return NextResponse.json({ error: 'chapterId est requis.' }, { status: 400 });

  const unlocks = await listChapterUnlocks(chapterId);
  return NextResponse.json(unlocks);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const body = (await request.json()) as { chapterId?: string; establishmentId?: string | null };
  if (typeof body.chapterId !== 'string') {
    return NextResponse.json({ error: 'chapterId est requis.' }, { status: 400 });
  }

  const result = await createChapterUnlock({
    chapterId: body.chapterId,
    establishmentId: body.establishmentId ?? null,
    adminId: guard.admin.id,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
