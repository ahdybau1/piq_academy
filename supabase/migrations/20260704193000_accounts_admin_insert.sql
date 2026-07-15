-- Autorise super_admin/admin_pays à créer un compte élève manuellement depuis
-- l'admin (section 13.4 du cahier des charges : "le Super-admin peut créer,
-- ajouter ou supprimer n'importe quel utilisateur"). Jusqu'ici accounts n'avait
-- que des policies SELECT/UPDATE/DELETE côté admin, aucune pour INSERT.
drop policy if exists accounts_admin_insert on accounts;

create policy accounts_admin_insert on accounts
for insert
with check (
  exists (
    select 1 from admin_users au
    where au.id = auth.uid()
    and au.role in ('super_admin', 'admin_pays')
  )
);
