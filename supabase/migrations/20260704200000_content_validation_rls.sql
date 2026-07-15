-- File de validation de contenu pédagogique (section 2.5 du cahier des charges) :
-- RLS pour subjects/chapters/lessons/content_versions/validation_queue, aucune de ces
-- tables n'avait de policy jusqu'ici (jamais utilisées en app).
alter table subjects enable row level security;
alter table chapters enable row level security;
alter table lessons enable row level security;
alter table content_versions enable row level security;
alter table validation_queue enable row level security;

drop policy if exists content_admin_all_subjects on subjects;
create policy content_admin_all_subjects on subjects
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

drop policy if exists content_admin_all_chapters on chapters;
create policy content_admin_all_chapters on chapters
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

drop policy if exists content_admin_all_lessons on lessons;
create policy content_admin_all_lessons on lessons
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

drop policy if exists content_admin_all_content_versions on content_versions;
create policy content_admin_all_content_versions on content_versions
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

drop policy if exists content_admin_select_validation_queue on validation_queue;
create policy content_admin_select_validation_queue on validation_queue
for select
using (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
);

drop policy if exists content_admin_insert_validation_queue on validation_queue;
create policy content_admin_insert_validation_queue on validation_queue
for insert
with check (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
);

-- Un admin ne peut jamais réviser (approuver/renvoyer/rejeter) sa propre soumission —
-- voir le skill content-validation-workflow. Défense en profondeur : revérifié aussi
-- côté application dans src/lib/content/mutations.ts.
drop policy if exists content_admin_update_validation_queue on validation_queue;
create policy content_admin_update_validation_queue on validation_queue
for update
using (
  submitted_by is distinct from auth.uid()
  and exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
);
