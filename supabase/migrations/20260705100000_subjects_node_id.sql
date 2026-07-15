-- Rattachement matière ↔ classe (section 1.5 du cahier des charges) : une matière a une
-- classe de rattachement de base obligatoire (subjects.node_id), et peut en plus être
-- partagée avec d'autres classes via subject_class_links (déjà existante, jamais utilisée
-- jusqu'ici — aucune policy RLS dessus).

-- Nettoyage des 2 matières de test créées avant que node_id n'existe (données de test de
-- cette session, aucune dépendance : subject_class_links/chapters/content_catalog vides
-- pour ces ids au moment de la migration).
delete from subjects where id in (
  'ba437f53-68ad-41ef-9759-6e263e22b097',
  '3ed6877d-e7aa-49e4-a113-5c93057108d1'
);

alter table subjects
  add column node_id uuid references academic_nodes(id),
  alter column node_id set not null;

alter table subject_class_links enable row level security;

drop policy if exists content_admin_all_subject_class_links on subject_class_links;
create policy content_admin_all_subject_class_links on subject_class_links
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
