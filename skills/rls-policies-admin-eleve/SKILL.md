---
name: rls-policies-admin-eleve
description: Applique ce skill à chaque fois que tu crées une table, une fonction Supabase, ou une route API dans ce projet. La sécurité repose entièrement sur Row Level Security au niveau base de données, pas sur des vérifications côté application. Toute nouvelle table doit avoir ses policies définies dans la même migration qui la crée — jamais en tâche séparée "à faire plus tard". Utilise ce skill aussi si le sujet est le cloisonnement entre profils, les rôles admin, ou l'accès aux données financières.
---

# Politiques RLS — Application Élève vs Application Administration

## Le principe de base du projet

Une seule base de données PostgreSQL (Supabase), partagée entre l'app Élève et l'app Admin. La séparation de sécurité ne se fait **jamais** au niveau applicatif seul — elle est imposée par des policies RLS activées sur chaque table. Si une table n'a pas de policy RLS active, considère que c'est un bug bloquant, pas un détail à corriger plus tard.

```sql
ALTER TABLE nom_de_la_table ENABLE ROW LEVEL SECURITY;
```

## Les trois niveaux d'accès à coder systématiquement

### 1. Élève — cloisonnement strict par profil actif

Un élève ne voit que le contenu de sa propre classe/série. La policy doit toujours vérifier `profiles.class_node_id` du profil actuellement authentifié :

```sql
CREATE POLICY eleve_lecture_contenu ON lessons
FOR SELECT
USING (
    chapter_id IN (
        SELECT c.id FROM chapters c
        JOIN profiles p ON p.class_node_id = (
            SELECT subject_class_links.class_node_id
            FROM subject_class_links WHERE subject_class_links.subject_id = c.subject_id
        )
        WHERE p.account_id = auth.uid() AND p.status = 'actif'
    )
);
```

Adapte la jointure exacte à la table concernée, mais le principe ne change jamais : la classe du profil actif est la seule source de vérité pour ce qu'un élève peut lire.

### 2. Admin — accès selon le rôle et le périmètre, jamais un accès total par défaut

```sql
CREATE POLICY admin_gestion_contenu ON lessons
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.role IN ('super_admin', 'admin_pays', 'admin_contenu', 'enseignant')
        AND (au.role = 'super_admin' OR au.scope_json ? chapter_id::text)
    )
);
```

Ne jamais écrire une policy admin du type `USING (true)` "pour aller vite" — même en développement. Si un rôle a besoin d'un accès large, c'est `super_admin`, pas une policy permissive par défaut.

### 3. Confidentialité financière — règle absolue du projet

Les tables `transactions`, `subscription_tiers` (colonne prix), et toute statistique de revenu ne sont lisibles **que** par `super_admin`. Aucune exception, aucun rôle intermédiaire :

```sql
CREATE POLICY finances_super_admin_uniquement ON transactions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid() AND au.role = 'super_admin'
    )
);
```

Si tu écris une fonction ou une vue qui expose un montant à un rôle autre que `super_admin`, c'est une régression par rapport au cahier des charges — pas une simplification acceptable.

## Session unique : contrainte à vérifier avant chaque connexion

Le projet impose qu'un compte n'ait qu'une seule session active à la fois (mobile OU web, jamais les deux). Ce n'est pas géré par RLS mais par une table `sessions` avec un champ `is_active` — toute nouvelle connexion doit désactiver l'ancienne session avant d'en créer une nouvelle. Vérifie que ce comportement est implémenté avant de considérer l'authentification comme terminée.

## Connexion à Supabase — jamais de clé en dur, jamais dans un skill

Deux clés existent pour ce projet : `anon` (respecte RLS, utilisable côté client) et `service_role` (contourne RLS, jamais côté client, jamais commitée).

Les vraies valeurs vivent uniquement dans `.env.local`, explicitement listé dans `.gitignore` :

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # uniquement si un script backend en a besoin
```

Si tu écris du code qui a besoin de la `service_role`, il doit tourner côté serveur uniquement (Edge Function, route API backend) — jamais dans un composant React, jamais dans un fichier exposé au navigateur.

## Le filtrage de navigation n'est jamais une mesure de sécurité — un constat vécu sur ce projet

Un design ou un prototype front-end peut cacher un module entier du menu selon le rôle (ex : masquer "Commercial" pour un `admin_contenu`). **Ce filtrage protège l'expérience utilisateur, il ne protège rien du tout côté données.** N'importe qui connaissant l'URL directe d'une page peut y accéder si la vraie protection n'existe qu'au niveau du menu.

Constat concret sur ce projet : le prototype généré par un outil de design IA a implémenté un filtrage de navigation par rôle qui fonctionnait bien visuellement (`sidebar-nav.tsx`), mais la quasi-totalité des pages elles-mêmes ne vérifiaient aucun rôle en interne — la protection reposait uniquement sur le fait de ne pas afficher le lien dans le menu. Si ce code avait été branché tel quel sur Supabase sans revoir ce point, n'importe quel utilisateur authentifié aurait pu appeler l'URL `/commercial/transactions` directement et voir les données financières, malgré le menu qui les cachait.

**Règle à appliquer systématiquement** : la policy RLS sur la table concernée est la seule barrière qui compte. Le filtrage de menu, les conditions d'affichage React, les redirections côté client — tout ça est du confort d'interface, jamais une protection. Si une page front-end affiche des données financières à un rôle non autorisé simplement parce que la policy RLS a été oubliée sur la table sous-jacente, c'est une faille de sécurité réelle, peu importe que le menu ait bien caché le lien.

## Test à faire systématiquement avant de valider une migration

Pour chaque nouvelle table avec RLS :
1. Se connecter en tant qu'élève d'une classe A → vérifier qu'il ne voit rien de la classe B
2. Se connecter en tant qu'admin_contenu → vérifier qu'il ne voit pas les transactions
3. Se connecter en tant que super_admin → vérifier l'accès complet

Si un de ces trois tests échoue, la table n'est pas prête pour la production, peu importe le reste du code.
