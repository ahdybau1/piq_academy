-- Bibliothèque de médias (section 2.7) : RLS sur la table + bucket Storage dédié.
-- Le scoping classe/série (section D du plan) ajoutera class_node_id dans une migration
-- séparée une fois l'écran dédié construit — ici on ne pose que le socle nécessaire à
-- l'éditeur de leçon (upload + liste).

alter table media_library enable row level security;

drop policy if exists content_admin_all_media_library on media_library;
create policy content_admin_all_media_library on media_library
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

-- Bucket public en lecture (les médias de leçon sont servis à l'élève via URL directe) ;
-- seul l'upload/la suppression est restreint aux admins habilités.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists media_bucket_public_read on storage.objects;
create policy media_bucket_public_read on storage.objects
for select
using (bucket_id = 'media');

drop policy if exists media_bucket_admin_write on storage.objects;
create policy media_bucket_admin_write on storage.objects
for insert
with check (
  bucket_id = 'media'
  and exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
);

drop policy if exists media_bucket_admin_delete on storage.objects;
create policy media_bucket_admin_delete on storage.objects
for delete
using (
  bucket_id = 'media'
  and exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
);
