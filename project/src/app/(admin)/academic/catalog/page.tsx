import { requireRole } from '@/lib/auth/current-admin';
import { listSubjects } from '@/lib/content/queries';
import { CATALOG_ADMIN_ROLES } from '@/lib/content/constants';
import { CatalogPageView } from '@/components/academic/catalog-page';
import { getResolvedCountry } from '@/lib/country-scope';

export default async function CatalogPage() {
  // Garde de rôle côté serveur : redirige vers /unauthorized si le rôle n'est pas autorisé.
  // Ceci est une protection de confort — la vraie barrière est la policy RLS sur content_catalog,
  // réservée à super_admin/admin_contenu (section 16.0, admin_pays exclu).
  await requireRole([...CATALOG_ADMIN_ROLES]);

  const { selectedCountryId } = await getResolvedCountry();
  const subjects = await listSubjects(selectedCountryId ?? undefined);

  return <CatalogPageView initialSubjects={subjects} countryId={selectedCountryId} />;
}
