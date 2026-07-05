import { requireRole } from '@/lib/auth/current-admin';
import { listValidationQueue } from '@/lib/content/queries';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { ValidationQueuePageView } from '@/components/validation/queue-page';

export default async function ValidationQueuePage() {
  // Garde de rôle côté serveur : redirige vers /unauthorized si le rôle n'est pas autorisé.
  // Ceci est une protection de confort — la vraie barrière est la policy RLS sur validation_queue.
  await requireRole([...CONTENT_ADMIN_ROLES]);

  const items = await listValidationQueue();

  return <ValidationQueuePageView initialItems={items} />;
}
