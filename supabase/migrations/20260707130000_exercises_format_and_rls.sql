-- Gestion des exercices (section 2.4), jusqu'ici absente de l'application.
-- `format` est une dimension distincte de `type` (entraînement/évaluation) et
-- `difficulty` (simple/intermédiaire/approfondissement) : QCM, réponse courte/numérique,
-- rédaction, réponse manuscrite, texte à trous, flashcard.
alter table exercises add column if not exists format character varying not null default 'qcm';
alter table exercises alter column format drop default;

-- Cas "indépendant de tout chapitre/leçon" (mélange de chapitres d'une même matière,
-- type examen) : lesson_id et chapter_id restent tous deux null, mais l'exercice doit
-- au moins être rattaché à une matière pour être retrouvable/filtrable.
alter table exercises add column if not exists subject_id uuid references subjects(id);

-- Réordonnancement explicite requis par la section 2.4 (absent du schéma initial).
alter table exercises add column if not exists display_order integer not null default 0;

alter table exercises enable row level security;

drop policy if exists content_admin_all_exercises on exercises;
create policy content_admin_all_exercises on exercises
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

alter table exercise_versions enable row level security;

drop policy if exists content_admin_all_exercise_versions on exercise_versions;
create policy content_admin_all_exercise_versions on exercise_versions
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
