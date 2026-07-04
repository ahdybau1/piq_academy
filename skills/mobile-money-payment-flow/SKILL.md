---
name: mobile-money-payment-flow
description: Utilise ce skill dès que tu codes l'initiation d'un paiement, la réception d'un webhook de l'agrégateur (Campay, Notch Pay, Monetbil), ou la réconciliation d'une transaction ambiguë. Applique-le aussi pour tout ce qui touche à la table transactions ou payment_reconciliation. Ne code jamais un appel direct aux API des opérateurs Mobile Money (MTN, Orange) — le projet passe systématiquement par un agrégateur.
---

# Flux de paiement Mobile Money via agrégateur

## Le principe non négociable

Ce projet ne se connecte jamais directement aux API des opérateurs télécoms (MTN MoMo, Orange Money). Toute intégration passe par un agrégateur (Campay, Notch Pay ou Monetbil), qui a déjà négocié l'accès technique et juridique avec les opérateurs. Voir cahier des charges Partie 3, section 32, pour la justification complète.

## Le flux en 6 étapes, à respecter dans l'ordre

```
1. L'élève initie un paiement dans l'app
   → INSERT dans `transactions` avec status = 'en_attente'
2. Le backend (Edge Function) appelle l'API de l'agrégateur pour initier la transaction
3. L'agrégateur envoie le code USSD de validation au téléphone de l'élève
4. L'élève valide le code sur son téléphone (hors de l'application)
5. L'agrégateur notifie l'application via un Webhook (Edge Function dédiée)
   → vérifie la signature cryptographique AVANT tout traitement
   → UPDATE transactions SET status = 'confirme'
6. Le trigger `trg_monthly_spend_insert` / `trg_monthly_spend_update` se déclenche automatiquement
```

**Ne jamais coder de logique métier (cumul mensuel, déblocage d'abonnement) directement dans le code de l'Edge Function du webhook.** Cette logique existe déjà dans les triggers PostgreSQL (`update_monthly_spend()`). Le rôle du webhook se limite à : vérifier la signature, mettre à jour `transactions.status`. Le reste se déclenche automatiquement en base — dupliquer cette logique côté application créerait deux sources de vérité divergentes.

## Vérification de signature — jamais optionnelle

```js
// Exemple de structure attendue, à adapter selon la doc de l'agrégateur choisi
function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

Un webhook sans vérification de signature est une porte ouverte : n'importe qui connaissant l'URL pourrait simuler un paiement confirmé. Si l'agrégateur choisi ne fournit pas de signature HMAC, exige au minimum une vérification par rappel API (`GET /transactions/{id}` vers l'agrégateur) avant de confirmer.

## Gestion de l'ambiguïté — ne jamais laisser une transaction en incertitude silencieuse

Si le webhook n'arrive jamais dans un délai raisonnable (15 minutes, configurable) :

```sql
-- Tâche planifiée de rattrapage, à exécuter périodiquement
-- Interroge directement l'agrégateur pour les transactions en_attente depuis trop longtemps
select id, profile_id, amount, aggregator_ref
from transactions
where status = 'en_attente'
and created_at < now() - interval '15 minutes';
```

Pour chaque résultat, interroger l'API de l'agrégateur avec `aggregator_ref`. Si un écart est détecté entre ce que dit l'agrégateur et l'état en base, insérer dans `payment_reconciliation` — jamais forcer un statut sans preuve, jamais laisser une transaction bloquée indéfiniment sans qu'un admin ne soit notifié.

## Ce qu'il ne faut jamais faire

- Ne jamais construire une UI qui affiche "paiement en cours" sans limite de temps — après le délai de rattrapage, affiche un message explicite ("Nous vérifions votre paiement, vous serez notifié")
- Ne jamais faire confiance à une réponse HTTP 200 du webhook sans vérifier le contenu réel du payload
- Ne jamais coder les identifiants de l'agrégateur (clé API, secret webhook) en dur — variables d'environnement uniquement, jamais commitées

## Tester avant de considérer le flux terminé

Reproduis les 3 scénarios qu'on a validés en base aujourd'hui, mais depuis l'application cette fois :
1. Paiement confirmé directement (webhook arrive vite)
2. Paiement qui reste `en_attente` puis passe à `confirme` (webhook en retard)
3. Paiement qui ne reçoit jamais de webhook (déclenche la réconciliation)
