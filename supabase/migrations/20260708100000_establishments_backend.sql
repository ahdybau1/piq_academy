-- Backend des établissements et épreuves d'établissement (Partie 2, section 4) — jusqu'ici
-- uniquement de la donnée mockée côté frontend, ni RLS ni stockage réel.
-- `is_active` manquait pour représenter "créer/modifier/désactiver un établissement" (4.1).
alter table establishments add column if not exists is_active boolean not null default true;

-- Les épreuves d'établissement passent par le même workflow de validation que le contenu
-- pédagogique (4.2), mais sans le mécanisme de versioning JSON des leçons/exercices — un
-- simple statut suffit puisqu'il n'y a qu'un document (sujet + correction), pas de contenu
-- structuré à versionner.
alter table establishment_papers add column if not exists status character varying not null default 'brouillon';

alter table establishments enable row level security;
alter table establishment_papers enable row level security;

drop policy if exists content_admin_all_establishments on establishments;
create policy content_admin_all_establishments on establishments
for all
using (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
)
with check (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
);

drop policy if exists content_admin_all_establishment_papers on establishment_papers;
create policy content_admin_all_establishment_papers on establishment_papers
for all
using (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
)
with check (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
);

insert into storage.buckets (id, name, public)
values ('establishment-papers', 'establishment-papers', true)
on conflict (id) do nothing;

drop policy if exists establishment_papers_bucket_public_read on storage.objects;
create policy establishment_papers_bucket_public_read on storage.objects
for select
using (bucket_id = 'establishment-papers');

drop policy if exists establishment_papers_bucket_admin_write on storage.objects;
create policy establishment_papers_bucket_admin_write on storage.objects
for insert
with check (
  bucket_id = 'establishment-papers'
  and exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
);

drop policy if exists establishment_papers_bucket_admin_delete on storage.objects;
create policy establishment_papers_bucket_admin_delete on storage.objects
for delete
using (
  bucket_id = 'establishment-papers'
  and exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
);
