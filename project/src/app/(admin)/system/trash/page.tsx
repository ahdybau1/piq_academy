import { requireRole } from '@/lib/auth/current-admin';
import { listTrashBatches } from '@/lib/trash/queries';
import { TRASH_ADMIN_ROLES } from '@/lib/trash/constants';
import { TrashPageView } from '@/components/system/trash-page';

export default async function TrashPage() {
  // Garde de rôle côté serveur : redirige vers /unauthorized si le rôle n'est pas autorisé.
  // Ceci est une protection de confort — la vraie barrière est la policy RLS sur trash_items.
  await requireRole([...TRASH_ADMIN_ROLES]);

  const batches = await listTrashBatches();

  return <TrashPageView initialBatches={batches} />;
}
