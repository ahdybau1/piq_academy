import { requireRole } from '@/lib/auth/current-admin';
import { listAccounts } from '@/lib/accounts/queries';
import { ACCOUNTS_ADMIN_ROLES } from '@/lib/accounts/constants';
import { AccountsPageView } from '@/components/users/accounts-page';
import { getResolvedCountry } from '@/lib/country-scope';

export default async function AccountsPage() {
  // Garde de rôle côté serveur : redirige vers /unauthorized si le rôle n'est pas autorisé.
  // Ceci est une protection de confort — la vraie barrière est la policy RLS sur accounts/profiles.
  await requireRole([...ACCOUNTS_ADMIN_ROLES]);

  const { selectedCountryId } = await getResolvedCountry();
  const accounts = await listAccounts(selectedCountryId ?? undefined);

  return <AccountsPageView initialAccounts={accounts} />;
}
