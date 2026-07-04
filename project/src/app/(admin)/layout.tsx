import { requireAdmin } from '@/lib/auth/current-admin';
import { createClient } from '@/lib/supabase/server';
import { ClientLayout } from '@/components/layout/client-layout';

export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  const supabase = await createClient();
  const { data: countries } = await supabase
    .from('academic_nodes')
    .select('id, name')
    .eq('node_type', 'pays')
    .eq('is_active', true)
    .order('display_order');

  return (
    <ClientLayout currentUser={admin} availableCountries={countries ?? []}>
      {children}
    </ClientLayout>
  );
}
