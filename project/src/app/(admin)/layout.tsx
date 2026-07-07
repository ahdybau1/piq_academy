import { requireAdmin } from '@/lib/auth/current-admin';
import { ClientLayout } from '@/components/layout/client-layout';
import { getResolvedCountry } from '@/lib/country-scope';

export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const { availableCountries, selectedCountryId } = await getResolvedCountry();

  return (
    <ClientLayout currentUser={admin} availableCountries={availableCountries} selectedCountryId={selectedCountryId}>
      {children}
    </ClientLayout>
  );
}
