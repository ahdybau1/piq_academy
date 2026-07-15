import { requireRole } from '@/lib/auth/current-admin';
import { CONTENT_ADMIN_ROLES } from '@/lib/content/constants';
import { MediaPage } from '@/components/academic/media-page';
import { getResolvedCountry } from '@/lib/country-scope';

export default async function Page() {
  // Garde de rôle côté serveur : redirige vers /unauthorized si le rôle n'est pas autorisé.
  // Ceci est une protection de confort — la vraie barrière est la policy RLS sur media_library.
  await requireRole([...CONTENT_ADMIN_ROLES]);

  const { selectedCountryId } = await getResolvedCountry();

  return <MediaPage countryId={selectedCountryId} />;
}
