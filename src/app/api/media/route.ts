import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { listMedia } from '@/lib/media/queries';
import { uploadMedia } from '@/lib/media/mutations';

export async function GET(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const classNodeId = new URL(request.url).searchParams.get('classNodeId') ?? undefined;
  const media = await listMedia(classNodeId);
  return NextResponse.json(media);
}

export async function POST(request: Request) {
  const guard = await requireApiRole(CONTENT_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const formData = await request.formData();
  const file = formData.get('file');
  const classNodeId = formData.get('classNodeId');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fichier requis.' }, { status: 400 });
  }
  if (typeof classNodeId !== 'string' || !classNodeId) {
    return NextResponse.json({ error: 'classNodeId est requis.' }, { status: 400 });
  }

  const result = await uploadMedia({ file, classNodeId, adminId: guard.admin.id });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result.media);
}
