-- Refonte du modèle des examens officiels (section 3), suite au retour utilisateur :
-- un examen officiel (BEPC, Probatoire C, Probatoire D...) n'est pas lié à UNE classe mais
-- doit déclarer explicitement l'ensemble des classes/séries habilitées à le composer — sans
-- ça rien n'empêchait de créer un examen sur une classe qui ne compose jamais d'examen
-- national (ex. 6e). `class_node_id` devient donc une table de liaison many-to-many, sur le
-- même principe que `subject_class_links` (tronc commun).
--
-- De plus, deux examens différents (ex. Probatoire C et Probatoire D) partagent parfois une
-- ou plusieurs épreuves communes (ex. Philosophie) sans partager toutes leurs épreuves — d'où
-- `exam_paper_shared_exams`, qui rattache une épreuve déjà créée sous un examen (son examen
-- "propriétaire", `exam_papers.exam_id`, inchangé) à un ou plusieurs autres examens, toujours
-- sur le même principe que `subject_class_links`.

create table if not exists exam_type_classes (
  id uuid primary key default gen_random_uuid(),
  exam_type_id uuid not null references official_exams(id) on delete cascade,
  class_node_id uuid not null references academic_nodes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (exam_type_id, class_node_id)
);

create table if not exists exam_paper_shared_exams (
  id uuid primary key default gen_random_uuid(),
  exam_paper_id uuid not null references exam_papers(id) on delete cascade,
  exam_type_id uuid not null references official_exams(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (exam_paper_id, exam_type_id)
);

-- Migration des données existantes : chaque examen garde sa classe actuelle comme classe
-- habilitée, pour ne rien perdre lors du passage au many-to-many.
insert into exam_type_classes (exam_type_id, class_node_id)
select id, class_node_id from official_exams
where class_node_id is not null
on conflict do nothing;

alter table official_exams drop column if exists class_node_id;

alter table exam_type_classes enable row level security;
alter table exam_paper_shared_exams enable row level security;

drop policy if exists content_admin_all_exam_type_classes on exam_type_classes;
create policy content_admin_all_exam_type_classes on exam_type_classes
for all
using (
  exists (select 1 from admin_users au where au.id = auth.uid() and au.role in ('super_admin', 'admin_pays', 'admin_contenu'))
)
with check (
  exists (select 1 from admin_users au where au.id = auth.uid() and au.role in ('super_admin', 'admin_pays', 'admin_contenu'))
);

drop policy if exists content_admin_all_exam_paper_shared_exams on exam_paper_shared_exams;
create policy content_admin_all_exam_paper_shared_exams on exam_paper_shared_exams
for all
using (
  exists (select 1 from admin_users au where au.id = auth.uid() and au.role in ('super_admin', 'admin_pays', 'admin_contenu'))
)
with check (
  exists (select 1 from admin_users au where au.id = auth.uid() and au.role in ('super_admin', 'admin_pays', 'admin_contenu'))
);
