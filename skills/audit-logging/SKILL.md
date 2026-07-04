---
name: audit-logging
description: Applique ce skill à chaque action administrative sensible que tu codes — création, modification, suspension, suppression d'un compte, d'un contenu, d'un rôle, d'une configuration. Le Super-admin doit pouvoir retrouver toute action faite par n'importe quel administrateur, sans exception. Utilise ce skill aussi si le sujet touche à la suppression de données ou à la gestion des permissions.
---

# Traçabilité totale des actions administratives

## La règle du projet, sans exception

Toute action de création, modification ou suppression effectuée par un compte `admin_users` doit être journalisée dans `audit_log`. Ce n'est pas une fonctionnalité optionnelle "à ajouter plus tard" — c'est une exigence de sécurité du cahier des charges (Partie 2, section 13.5) : le Super-admin doit pouvoir retrouver et consulter **toute suppression faite par n'importe quel administrateur**, aucune suppression n'est anonyme.

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id),
    action_type VARCHAR(30) NOT NULL, -- 'create' | 'update' | 'delete' | 'suspend' | 'publish' | ...
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    before_json JSONB,
    after_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_admin ON audit_log(admin_user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
```

## Implémentation recommandée : trigger PostgreSQL, pas du code applicatif dispersé

Ne compte pas sur le fait que chaque développeur (ou chaque appel API) pensera à écrire dans `audit_log` manuellement. Utilise un trigger générique sur les tables sensibles :

```sql
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (admin_user_id, action_type, entity_type, entity_id, before_json, after_json)
    VALUES (
        current_setting('app.current_admin_id', true)::uuid,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

Applique ce trigger sur toutes les tables où un admin peut agir : `academic_nodes`, `lessons`, `chapters`, `exercises`, `accounts`, `profiles`, `admin_users`, `refund_requests`. La variable de session `app.current_admin_id` doit être fixée à chaque requête authentifiée côté backend — vérifie que ce point est en place avant de considérer l'authentification admin comme terminée.

## Suppressions : jamais silencieuses, jamais irréversibles par défaut

Pour les entités sensibles (comptes, contenu publié), privilégie une désactivation (`is_active = false`, ou statut `archive`) plutôt qu'un `DELETE` physique immédiat. Si une suppression physique est nécessaire (ex : demande RGPD-like d'un utilisateur), elle doit être :
1. Journalisée dans `audit_log` avant l'exécution
2. Réservée à un rôle explicitement habilité (`super_admin`, ou délégation documentée)

## Erreur à ne jamais reproduire

Un script de nettoyage, une migration corrective, ou une commande d'admin exécutée directement en base sans passer par l'application (donc sans déclencher le trigger) casse la traçabilité. Si tu dois corriger des données en urgence directement en SQL, ajoute manuellement une entrée dans `audit_log` pour documenter l'intervention — ne laisse jamais un trou dans l'historique.
