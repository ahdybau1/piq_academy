import { requireRole } from '@/lib/auth/current-admin';
import { listSubscriptionTiers } from '@/lib/subscriptions/queries';
import { SUBSCRIPTION_ADMIN_ROLES } from '@/lib/subscriptions/constants';
import { SubscriptionsPageView } from '@/components/commercial/subscriptions-page';

export default async function SubscriptionsPage() {
  // Garde de rôle côté serveur : redirige vers /unauthorized si le rôle n'est pas autorisé.
  // Cette page manipule des données financières (Partie 2, §6) : Super-admin uniquement.
  await requireRole([...SUBSCRIPTION_ADMIN_ROLES]);

  const tiers = await listSubscriptionTiers();

  return <SubscriptionsPageView initialTiers={tiers} />;
}
