-- Trimestres (section 1.8) : les chapitres doivent obligatoirement être rattachés à un
-- trimestre existant, lui-même rattaché au pays (pas à la classe). Ajoute aussi le
-- déblocage anticipé exceptionnel par établissement (chapter_unlocks).

alter table terms
  add column school_year character varying,
  alter column school_year set not null;

alter table terms enable row level security;

drop policy if exists content_admin_all_terms on terms;
create policy content_admin_all_terms on terms
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

-- Nettoyage du chapitre de test créé avant que term_id ne soit obligatoire (donnée de
-- test de cette session) : 2 leçons de test rattachées, chacune avec une content_versions
-- en brouillon, aucune entrée validation_queue (jamais soumises).
delete from content_versions where content_id in (
  'c936d42a-ad9d-4017-a4aa-ef7a8310c069',
  '1d24e342-8f4a-4ea7-a137-5fce965ba353'
);
delete from lessons where chapter_id = 'fc8d9360-4f4f-4a1e-b242-f191d6162c81';
delete from chapters where id = 'fc8d9360-4f4f-4a1e-b242-f191d6162c81';

alter table chapters
  alter column term_id set not null;

create table if not exists chapter_unlocks (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id),
  establishment_id uuid references establishments(id),
  admin_id uuid references admin_users(id),
  created_at timestamptz default now()
);

alter table chapter_unlocks enable row level security;

drop policy if exists content_admin_all_chapter_unlocks on chapter_unlocks;
create policy content_admin_all_chapter_unlocks on chapter_unlocks
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
