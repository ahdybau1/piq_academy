-- Rend le catalogue pédagogique (section 16.0) réellement exploité : jusqu'ici
-- `content_catalog` n'était qu'un carnet d'étiquettes jamais référencé par le contenu
-- réel. Chaque leçon/exercice peut désormais être tagué par son type pédagogique
-- (Définition, Théorème, Exercice d'application, etc.), ce qui donne enfin un sens à
-- la vérification de dépendances avant suppression d'une entrée de catalogue.
alter table lessons add column if not exists catalog_id uuid references content_catalog(id);
alter table exercises add column if not exists catalog_id uuid references content_catalog(id);
