import { requireRole } from '@/lib/auth/current-admin';
import { listEstablishments } from '@/lib/establishments/queries';
import { ESTABLISHMENT_ADMIN_ROLES } from '@/lib/establishments/constants';
import { SchoolsPageView } from '@/components/academic/schools-page';
import { getResolvedCountry } from '@/lib/country-scope';

export default async function SchoolsPage() {
  // Garde de rôle côté serveur : redirige vers /unauthorized si le rôle n'est pas autorisé.
  // Ceci est une protection de confort — la vraie barrière est la policy RLS sur establishments/establishment_papers.
  await requireRole([...ESTABLISHMENT_ADMIN_ROLES]);

  const { selectedCountryId } = await getResolvedCountry();
  const establishments = await listEstablishments(selectedCountryId ?? undefined);

  return <SchoolsPageView initialEstablishments={establishments} countryId={selectedCountryId} />;
}
