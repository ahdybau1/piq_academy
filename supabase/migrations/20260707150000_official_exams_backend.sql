-- Backend des examens officiels nationaux (Partie 2, section 3) — jusqu'ici uniquement
-- de la donnée mockée côté frontend, ni RLS ni stockage réel.
-- `correction_visible` manquait pour représenter "visibilité de la correction" (section 3).
alter table exam_papers add column if not exists correction_visible boolean not null default false;

alter table official_exams enable row level security;
alter table exam_papers enable row level security;

drop policy if exists content_admin_all_official_exams on official_exams;
create policy content_admin_all_official_exams on official_exams
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

drop policy if exists content_admin_all_exam_papers on exam_papers;
create policy content_admin_all_exam_papers on exam_papers
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
values ('exam-papers', 'exam-papers', true)
on conflict (id) do nothing;

drop policy if exists exam_papers_bucket_public_read on storage.objects;
create policy exam_papers_bucket_public_read on storage.objects
for select
using (bucket_id = 'exam-papers');

drop policy if exists exam_papers_bucket_admin_write on storage.objects;
create policy exam_papers_bucket_admin_write on storage.objects
for insert
with check (
  bucket_id = 'exam-papers'
  and exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
);

drop policy if exists exam_papers_bucket_admin_delete on storage.objects;
create policy exam_papers_bucket_admin_delete on storage.objects
for delete
using (
  bucket_id = 'exam-papers'
  and exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays', 'admin_contenu')
  )
);
