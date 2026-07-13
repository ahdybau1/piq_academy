-- Un média dépend toujours d'une classe (et série) précise (règle confirmée métier,
-- section 2.7). Colonne nullable au niveau base pour ne pas casser d'éventuelles lignes
-- déjà en place lors de l'application de cette migration — le caractère obligatoire est
-- appliqué côté application (toute nouvelle création exige classNodeId, voir uploadMedia).
alter table media_library add column if not exists class_node_id uuid references academic_nodes(id);
