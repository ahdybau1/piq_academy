-- Corbeille générique : le Super-admin peut tout supprimer, mais rien n'est perdu —
-- chaque ligne supprimée est d'abord snapshotée ici (par lot, batch_id), restaurable ou
-- purgeable définitivement depuis l'écran Corbeille. Réservé au Super-admin ("admin
-- principal"), même logique d'accès que les autres opérations sensibles de cette session.
create table trash_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null,
  table_name text not null,
  row_data jsonb not null,
  deleted_by uuid references admin_users(id),
  deleted_at timestamptz not null default now(),
  restored_at timestamptz
);

create index trash_items_batch_id_idx on trash_items(batch_id);

alter table trash_items enable row level security;

drop policy if exists super_admin_all_trash_items on trash_items;
create policy super_admin_all_trash_items on trash_items
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
