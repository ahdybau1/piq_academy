import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { OFFICIAL_EXAM_ADMIN_ROLES } from '@/lib/official-exams/constants';
import { uploadExamDocument } from '@/lib/official-exams/mutations';

export async function POST(request: Request) {
  const guard = await requireApiRole(OFFICIAL_EXAM_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Fichier requis.' }, { status: 400 });

  const result = await uploadExamDocument({ file });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ url: result.url });
}
