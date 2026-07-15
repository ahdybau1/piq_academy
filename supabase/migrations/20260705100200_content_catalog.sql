-- Catalogue pédagogique (section 16.0) : accès restreint à super_admin + admin_contenu
-- uniquement, contrairement aux autres tables de contenu (admin_pays exclu — le cahier des
-- charges précise "Accès : Super-admin et Admin contenu (selon délégation)").
alter table content_catalog
  add column is_active boolean not null default true;

alter table content_catalog enable row level security;

drop policy if exists catalog_admin_all_content_catalog on content_catalog;
create policy catalog_admin_all_content_catalog on content_catalog
for all
using (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_contenu')
  )
)
with check (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_contenu')
  )
);
