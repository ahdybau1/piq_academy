-- Suppression en cascade explicite d'un palier d'abonnement (section 6.1) : is_active
-- permet de désactiver un palier déjà vendu au lieu de le supprimer physiquement (voir
-- src/lib/subscriptions/mutations.ts). Accès réservé au Super-admin : "l'ensemble des
-- données financières... n'est visible que par le Super-administrateur" (Partie 2, §6).
alter table subscription_tiers
  add column is_active boolean not null default true;

alter table subscription_tiers enable row level security;
alter table access_matrix enable row level security;

drop policy if exists super_admin_all_subscription_tiers on subscription_tiers;
create policy super_admin_all_subscription_tiers on subscription_tiers
for all
using (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid() and au.role = 'super_admin'
  )
)
with check (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid() and au.role = 'super_admin'
  )
);

drop policy if exists super_admin_all_access_matrix on access_matrix;
create policy super_admin_all_access_matrix on access_matrix
for all
using (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid() and au.role = 'super_admin'
  )
)
with check (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid() and au.role = 'super_admin'
  )
);
