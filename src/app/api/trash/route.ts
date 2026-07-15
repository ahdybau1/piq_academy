import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/api';
import { TRASH_ADMIN_ROLES } from '@/lib/trash/constants';
import { listTrashBatches } from '@/lib/trash/queries';

export async function GET() {
  const guard = await requireApiRole(TRASH_ADMIN_ROLES);
  if ('response' in guard) return guard.response;

  const batches = await listTrashBatches();
  return NextResponse.json(batches);
}
