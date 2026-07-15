-- Ajoute un statut explicite sur les comptes élève (accounts), distinct du
-- statut actif/archivé déjà présent sur profiles. Requis pour la suspension
-- de compte côté admin (section 5.1 du cahier des charges).
alter table accounts
  add column status text not null default 'actif'
  check (status in ('actif', 'suspendu'));
