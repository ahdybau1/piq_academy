-- Doublons de trimestres constatés en test (ex. deux "Trimestre 1" 2025-2026 pour le même
-- pays, avec des dates différentes et incohérentes) : la garde anti-double-soumission côté
-- client protège les clics répétés, mais rien n'empêchait deux admins — ou deux onglets — de
-- créer le même trimestre en parallèle. On supprime les doublons en gardant la ligne la plus
-- ancienne, seulement si aucun chapitre n'y est déjà rattaché, puis on ajoute une contrainte
-- d'unicité pour empêcher toute récidive.

with ranked as (
  select
    id,
    row_number() over (
      partition by country_id, name, school_year
      order by created_at asc, id asc
    ) as rn
  from public.terms
),
duplicates_to_remove as (
  select id from ranked where rn > 1
)
delete from public.terms
where id in (select id from duplicates_to_remove)
  and not exists (
    select 1 from public.chapters where chapters.term_id = terms.id
  );

alter table public.terms
  add constraint terms_country_name_school_year_key
  unique (country_id, name, school_year);
