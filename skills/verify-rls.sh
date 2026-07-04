#!/usr/bin/env bash
# verify-rls.sh — vérifie qu'aucune table publique n'est dépourvue de policy RLS
#
# Adapté du script verify-rls.sh de gstack (Garry Tan), simplifié pour PIQ Academy.
# Usage : bash verify-rls.sh
#
# Nécessite psql configuré avec les variables d'environnement Supabase,
# ou adapte la connexion à ta config (voir SUPABASE_DB_URL ci-dessous).

set -uo pipefail

: "${SUPABASE_DB_URL:?Variable SUPABASE_DB_URL manquante — connection string Postgres de ton projet Supabase}"

echo "=== Vérification RLS — PIQ Academy ==="
echo ""

# 1. Tables sans RLS activé du tout
echo "-- Tables SANS RLS activé (danger si non vide) --"
psql "$SUPABASE_DB_URL" -t -c "
select tablename
from pg_tables
where schemaname = 'public'
and tablename not in (
  select tablename from pg_tables t
  join pg_class c on c.relname = t.tablename
  where c.relrowsecurity = true
);
"

# 2. Tables avec RLS activé mais sans aucune policy (verrouillées à 100%, souvent un oubli)
echo ""
echo "-- Tables avec RLS actif mais ZÉRO policy (probablement un oubli) --"
psql "$SUPABASE_DB_URL" -t -c "
select tablename
from pg_tables
where schemaname = 'public'
and tablename not in (select distinct tablename from pg_policies where schemaname = 'public');
"

# 3. Résumé du nombre de policies par table
echo ""
echo "-- Nombre de policies par table --"
psql "$SUPABASE_DB_URL" -c "
select tablename, count(*) as nb_policies
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;
"

echo ""
echo "=== Fin de la vérification ==="
echo "Si la première liste n'est pas vide : RLS n'est pas activé, danger réel d'exposition de données."
echo "Si la deuxième liste n'est pas vide : la table est verrouillée pour tout le monde, y compris les usages légitimes."
