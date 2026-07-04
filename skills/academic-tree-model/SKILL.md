---
name: academic-tree-model
description: Utilise ce skill dès que tu crées, modifies ou interroges quoi que ce soit lié à l'arbre académique (pays, section, type d'enseignement, classe, série) ou aux matières/chapitres/leçons qui s'y rattachent. Applique-le systématiquement pour toute migration SQL, toute fonction backend, ou tout composant qui touche à academic_nodes, subjects, chapters, lessons. Ne crée jamais une table dédiée par niveau (table "classes", table "series", etc.) — c'est l'erreur que ce skill existe pour éviter.
---

# Modèle de l'arbre académique générique

## Le principe non négociable

L'arbre académique (Pays → Section → Type d'enseignement → Classe → Série) a une **profondeur variable selon le pays**. Certains pays ont 5-6 niveaux, d'autres 2-3. Une table relationnelle classique avec une table par niveau (`countries`, `sections`, `types_enseignement`, `classes`, `series`) est **interdite** dans ce projet — elle ne gère pas la profondeur variable et complique toute extension multi-pays.

**Solution imposée** : une seule table `academic_nodes` en auto-référence.

```sql
CREATE TABLE academic_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES academic_nodes(id),
    node_type VARCHAR(20) NOT NULL, -- 'pays' | 'section' | 'enseignement' | 'classe' | 'serie'
    name VARCHAR(100) NOT NULL,
    country_id UUID, -- redondant mais utile pour filtrer vite sans remonter tout l'arbre
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_academic_nodes_parent ON academic_nodes(parent_id);
CREATE INDEX idx_academic_nodes_type ON academic_nodes(node_type);
CREATE INDEX idx_academic_nodes_country ON academic_nodes(country_id);
```

## Règles de cascade à respecter dans tout le code

1. **Aucune création sans parent existant.** Avant tout `INSERT` dans `academic_nodes`, vérifier que `parent_id` existe (sauf pour `node_type = 'pays'`, qui est racine).
2. **Ordre strict de création** : pays → section → enseignement → classe → série → matière → chapitre → leçon. Ne jamais permettre à l'interface admin de proposer un niveau enfant si le parent n'existe pas.
3. **Suppression bloquée par défaut** si des enfants existent. Une cascade n'est déclenchée que si l'admin coche explicitement une option "supprimer aussi le contenu lié".
4. **Une matière peut être liée à plusieurs classes** via une table de liaison many-to-many (`subject_class_links`), pas dupliquée. Voir le modèle de données du cahier des charges, section 36.2.

## Écrire une requête pour récupérer un chemin complet

Toujours utiliser une CTE récursive, jamais une boucle applicative :

```sql
WITH RECURSIVE ancestors AS (
    SELECT id, parent_id, node_type, name, 0 AS depth
    FROM academic_nodes WHERE id = $1
    UNION ALL
    SELECT n.id, n.parent_id, n.node_type, n.name, a.depth + 1
    FROM academic_nodes n
    JOIN ancestors a ON n.id = a.parent_id
)
SELECT * FROM ancestors ORDER BY depth DESC;
```

## Le trimestre (`terms`) ne fait PAS partie de cet arbre

Le découpage temporel par trimestre est une table séparée (`terms`), liée à `country_id` et croisée avec les `chapters` — ce n'est jamais un niveau de `academic_nodes`. L'élève ne doit jamais voir le mot "trimestre" dans la navigation. Voir cahier des charges Partie 2, section 1.8, si un doute survient sur cette distinction.

## Erreur à ne jamais reproduire

Si tu te retrouves à écrire `ALTER TABLE academic_nodes ADD COLUMN serie_id`, ou à créer une table `classes` séparée pour "simplifier les requêtes" — arrête-toi. C'est exactement le contre-modèle que cette architecture a été choisie pour éviter. La complexité doit rester dans les requêtes récursives, pas dans le schéma.
