import { requireRole } from '@/lib/auth/current-admin';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { TermsPageView } from '@/components/academic/terms-page';

export default async function TermsPage() {
  // Garde de rôle côté serveur : redirige vers /unauthorized si le rôle n'est pas autorisé.
  // Ceci est une protection de confort — la vraie barrière est la policy RLS sur terms.
  await requireRole([...CONTENT_ADMIN_ROLES]);

  return <TermsPageView />;
}
