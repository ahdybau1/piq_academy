-- Requête utilisée pour générer docs/schema-reel.md.
-- À relancer après toute migration modifiant une table, puis exporter le résultat
-- (bouton "Export data" / download CSV du SQL Editor Supabase) vers
-- docs/schema-raw.csv, et régénérer les sections concernées de schema-reel.md.
with cols as (
  select
    c.table_name,
    c.ordinal_position,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
  from information_schema.columns c
  join information_schema.tables t
    on t.table_schema = c.table_schema and t.table_name = c.table_name
  where c.table_schema = 'public' and t.table_type = 'BASE TABLE'
),
fks as (
  select
    tc.table_name,
    kcu.column_name,
    ccu.table_name as foreign_table_name,
    ccu.column_name as foreign_column_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
  join information_schema.constraint_column_usage ccu
    on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
  where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public'
)
select
  cols.table_name,
  cols.ordinal_position,
  cols.column_name,
  cols.data_type,
  cols.is_nullable,
  cols.column_default,
  fks.foreign_table_name,
  fks.foreign_column_name
from cols
left join fks on fks.table_name = cols.table_name and fks.column_name = cols.column_name
order by cols.table_name, cols.ordinal_position;
