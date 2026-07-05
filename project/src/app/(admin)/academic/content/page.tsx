import { requireRole } from '@/lib/auth/current-admin';
import { listSubjects } from '@/lib/content/queries';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { ContentPageView } from '@/components/academic/content-page';

export default async function ContentPage() {
  // Garde de rôle côté serveur : redirige vers /unauthorized si le rôle n'est pas autorisé.
  // Ceci est une protection de confort — la vraie barrière est la policy RLS sur subjects/chapters/lessons.
  await requireRole([...CONTENT_ADMIN_ROLES]);

  const subjects = await listSubjects();

  return <ContentPageView initialSubjects={subjects} />;
}
