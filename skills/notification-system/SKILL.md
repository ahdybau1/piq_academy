---
name: notification-system
description: Utilise ce skill dès que tu codes l'envoi d'une notification (push, email, SMS, in-app), la gestion des templates de notification, ou tout déclencheur automatique lié à un événement (expiration d'abonnement, contenu publié, remboursement traité). Applique-le aussi pour les tables notification_templates, notification_log, scheduled_reminders.
---

# Système de notifications multi-canal

## Principe : les déclencheurs et le contenu sont séparés, jamais codés en dur ensemble

Un événement système (ex : abonnement qui expire dans 3 jours) ne doit jamais avoir son texte de notification écrit directement dans le code applicatif. Le texte vit dans `notification_templates`, modifiable depuis l'administration sans redéploiement. Le code applicatif se contente de déclencher l'événement et de fournir les variables.

```sql
-- Exemple de structure d'un template
select title_template, body_template
from notification_templates
where event_key = 'abonnement_expiration_j3' and channel = 'push';

-- title_template : "Votre abonnement expire bientôt"
-- body_template : "Votre abonnement {{classe}} se termine dans {{jours}} jours."
```

Le code applicatif remplace `{{classe}}` et `{{jours}}` au moment de l'envoi — jamais de logique conditionnelle complexe dans le template lui-même, qui doit rester éditable par un admin non-technique.

## Catalogue des déclencheurs — référence-toi toujours à celui du cahier des charges

Le catalogue complet est en Partie 1, section 6.4. Ne crée jamais un nouvel `event_key` sans vérifier s'il correspond déjà à une entrée existante. Exemples déjà définis :

| event_key | Déclencheur | Canaux |
|---|---|---|
| `abonnement_j3` | 3 jours avant expiration | push, in-app |
| `abonnement_j1` | 1 jour avant expiration | push, in-app (bannière persistante) |
| `abonnement_expire` | Jour J, passage au gratuit | push, in-app (écran dédié) |
| `cumul_mensuel_atteint` | Requalification automatique | in-app |
| `paiement_ambigu` | Réconciliation nécessaire | in-app + ticket support |
| `remboursement_decide` | Décision prise | in-app + email |
| `contenu_traduction_a_valider` | Nouvelle tâche traducteur | in-app |

## Fonction d'envoi générique — un seul point d'entrée, pas un appel par canal dispersé dans le code

```js
async function sendNotification(profileId, eventKey, variables = {}) {
  const templates = await getTemplatesForEvent(eventKey); // toutes langues/canaux actifs

  for (const template of templates) {
    const renderedTitle = renderTemplate(template.title_template, variables);
    const renderedBody = renderTemplate(template.body_template, variables);

    await dispatchToChannel(template.channel, profileId, renderedTitle, renderedBody);

    await logNotification(profileId, template.id); // insert dans notification_log
  }
}
```

Ne disperse jamais des appels directs à un service push/SMS/email à plusieurs endroits du code. Un seul point d'entrée (`sendNotification`) permet de changer de fournisseur (ex : passer de Twilio à un autre SMS gateway) sans toucher à la logique métier qui déclenche les notifications.

## Fréquence dégressive pour les relances — ne jamais spammer

Le cahier des charges impose des relances espacées après expiration (J+1, J+7, J+30), pas quotidiennes. Utilise `scheduled_reminders` pour programmer ces relances à l'avance plutôt que de calculer la fréquence à chaque exécution d'une tâche planifiée :

```sql
insert into scheduled_reminders (profile_id, reminder_type, trigger_date)
values
  ($1, 'relance_reabonnement', current_date + interval '1 day'),
  ($1, 'relance_reabonnement', current_date + interval '7 days'),
  ($1, 'relance_reabonnement', current_date + interval '30 days');
```

Une tâche planifiée quotidienne interroge `scheduled_reminders` où `trigger_date = today() and sent = false`, envoie, puis marque `sent = true`. Elle ne doit jamais recalculer la logique de fréquence — celle-ci est déjà figée au moment de la programmation.

## Ce qu'il ne faut jamais faire

- Ne jamais envoyer une notification sans vérifier au préalable les préférences de l'utilisateur (`Paramètres > Notifications`, désactivables par type)
- Ne jamais dupliquer le texte d'une notification dans le code frontend "pour faire un aperçu" — récupère toujours le texte réel depuis `notification_templates`
- Ne jamais oublier `notification_log` — sans lui, impossible de mesurer un taux d'ouverture ou de déboguer une notification non reçue
