---
name: subscription-access-control
description: Utilise ce skill dès que tu codes une vérification d'accès à une fonctionnalité ou un contenu selon le palier d'abonnement (gratuit/journalier/hebdomadaire/mensuel/annuel). Applique-le pour tout écran ou route API qui décide si un profil peut voir, télécharger, ou utiliser quelque chose. Ne code jamais une vérification de palier en dur (if tier == 'mensuel') dans plusieurs endroits différents.
---

# Contrôle d'accès par palier d'abonnement

## Un seul point de vérité : la table access_matrix, jamais une condition en dur

Chaque fonctionnalité a une clé (`feature_key`) et un niveau d'accès par palier dans `access_matrix`. Le code applicatif ne doit **jamais** contenir de logique du type :

```js
// INTERDIT — logique dupliquée à chaque nouvel écran, source de désynchronisation
if (profile.subscription_tier === 'gratuit' && feature === 'examens_officiels') {
  return { access: false };
}
```

Utilise systématiquement une fonction unique qui interroge `access_matrix` :

```js
async function checkAccess(profileId, featureKey) {
  const profile = await getProfile(profileId);
  const rule = await db.query(`
    select access_level, limit_value
    from access_matrix am
    join subscription_tiers st on st.id = am.tier_id
    where st.class_node_id = $1 and st.name = $2 and am.feature_key = $3
  `, [profile.class_node_id, profile.subscription_tier, featureKey]);

  if (!rule) return { access: 'aucun' };
  return { access: rule.access_level, limit: rule.limit_value };
}
```

## Le mécanisme de cumul mensuel est déjà géré par trigger — ne le réimplémente jamais côté application

La logique de cumul (addition des paiements courts, requalification automatique vers le mensuel dès que le seuil est atteint) existe déjà dans le trigger PostgreSQL `update_monthly_spend()`. Le code applicatif n'a **rien à recalculer** — il lit simplement `profiles.subscription_tier`, qui est déjà à jour après chaque transaction confirmée.

Si tu te retrouves à écrire du code JavaScript qui additionne des montants de `transactions` pour décider d'un palier, c'est un signal d'alerte : cette logique existe déjà en base, ne la duplique pas.

## Le seuil de cumul est figé au prix du premier jour du mois — ne l'oublie jamais dans l'UI

Si tu affiches une barre de progression "vous êtes à X FCFA sur Y FCFA pour débloquer le Mensuel", utilise toujours `monthly_spend_counter.locked_threshold`, jamais `subscription_tiers.price` en temps réel. Le prix affiché à l'élève ne doit pas bouger en cours de mois même si l'admin change le tarif — décision actée dans le cahier des charges, Partie 1 section 6.2.

## Floutage et incitation — comportement attendu de l'interface

Quand `checkAccess()` retourne `access: 'aucun'` ou `access: 'limite'` avec la limite atteinte :

- Le contenu doit apparaître visuellement flouté ou verrouillé, **jamais** avec un message permanent du type "abonnement requis" affiché en continu
- Au clic uniquement, afficher le palier exact nécessaire et le prix correspondant (récupéré depuis `subscription_tiers`, pas codé en dur dans le composant)
- Ne jamais bloquer la navigation générale — l'élève doit pouvoir fermer la popup et continuer à naviguer sur le contenu accessible

```js
function renderFeature(accessResult, tierNeeded, price) {
  if (accessResult.access === 'complet') return <FullContent />;
  if (accessResult.access === 'limite') return <LimitedContent limit={accessResult.limit} />;
  return (
    <BlurredContent onClick={() =>
      showUpsellModal(`Ce contenu fait partie de l'abonnement ${tierNeeded} (${price} FCFA)`)
    } />
  );
}
```

## Ce qu'il ne faut jamais faire

- Ne jamais coder un prix ou un nom de palier en dur dans le frontend — toujours lu depuis `subscription_tiers`
- Ne jamais vérifier l'accès uniquement côté frontend — la policy RLS sur la table concernée doit être la véritable barrière de sécurité, le frontend n'est qu'un confort d'affichage
- Ne jamais afficher de mention commerciale explicite en navigation passive — uniquement au clic, conformément à la règle du cahier des charges (Partie 2, section 6.1bis)
