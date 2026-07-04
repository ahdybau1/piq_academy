---
name: content-validation-workflow
description: Utilise ce skill dès que tu implémentes la création, la modification ou la publication de contenu pédagogique (cours, chapitres, leçons, exercices) dans l'application admin. Applique-le aussi pour toute fonctionnalité liée à la table validation_queue ou à un statut de contenu. Aucun contenu ne doit jamais passer directement de "créé" à "publié" sans passer par ce workflow, même en mode développement/test.
---

# Workflow de validation du contenu pédagogique

## Le cycle de statut imposé, sans exception

```
brouillon → en_attente_de_validation → publie
                    │
                    ├──→ a_corriger → (retour à en_attente_de_validation après correction)
                    │
                    └──→ rejete
```

Un contenu créé par un enseignant ou un admin contenu passe **toujours** par le statut `en_attente_de_validation` avant `publie`. Même en développement, ne saute pas cette étape "pour tester plus vite" — le workflow lui-même fait partie de ce qui doit être testé.

```sql
CREATE TABLE validation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(20) NOT NULL, -- 'lesson' | 'chapter' | 'exercise' | 'exam_paper'
    content_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'en_attente_de_validation',
    submitted_by UUID REFERENCES admin_users(id),
    reviewed_by UUID REFERENCES admin_users(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);
```

## Qui peut faire quoi — ne pas mélanger les rôles

- **Enseignant / Admin contenu** : peut soumettre (`brouillon` → `en_attente_de_validation`), ne peut jamais s'auto-valider
- **Admin pays** (ou rôle habilité) : seul habilité à faire passer `en_attente_de_validation` → `publie` ou → `a_corriger` / `rejete`
- Si tu codes une fonction qui permet à l'auteur de valider son propre contenu, c'est un bug de sécurité fonctionnelle, pas une optimisation de workflow.

## Versioning : ne jamais écraser silencieusement

Toute modification d'un contenu déjà `publie` crée une **nouvelle version**, elle ne modifie pas la version en ligne directement.

```sql
CREATE TABLE content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    content_json JSONB NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

La nouvelle version repasse par le workflow complet avant de remplacer la version visible côté élève. Le contenu déjà téléchargé en PDF par un élève n'est jamais modifié rétroactivement.

## Pré-analyse automatique : elle assiste, elle ne décide jamais

Si tu implémentes une pré-analyse IA (orthographe, cohérence, conformité au template) avant la revue humaine, son résultat est un **rapport joint** à l'entrée de `validation_queue`, jamais un déclencheur automatique de publication. Un contenu ne peut jamais atteindre `publie` sans qu'un humain avec le rôle habilité ait explicitement validé.

```sql
ALTER TABLE validation_queue ADD COLUMN ai_report_json JSONB;
```

## Erreur à ne jamais reproduire

Un endpoint ou une fonction du type `publish_content_directly()` qui contourne `validation_queue`, même pour un usage interne ou un script de seed de données de test en production, est interdit. Si tu as besoin de contenu publié rapidement pour tester, force le passage par le workflow avec un compte de test ayant le bon rôle — ne crée pas de raccourci qui pourrait fuiter en production.
