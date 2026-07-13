-- Paramètres d'un pays (section 1.1) : "modifier (nom, langues officielles, devise,
-- calendrier scolaire officiel)". Séparé de `academic_nodes` (générique, sans colonnes
-- spécifiques à un type de nœud — cf. Partie 4 §35) : un seul ensemble de paramètres par
-- nœud de type `pays`, dans sa propre table plutôt que d'alourdir l'arbre générique.
create table if not exists country_settings (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null unique references academic_nodes(id) on delete cascade,
  official_languages text[] not null default '{}',
  currency varchar(10),
  school_year_start_date date,
  school_year_end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table country_settings enable row level security;

drop policy if exists academic_admin_all_country_settings on country_settings;
create policy academic_admin_all_country_settings on country_settings
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
