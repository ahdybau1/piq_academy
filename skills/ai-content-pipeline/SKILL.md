---
name: ai-content-pipeline
description: Utilise ce skill dès que tu construis un agent IA pour l'application (structuration de cours, génération d'exercices, modération du forum, OCR de scans). Applique-le pour toute fonction qui appelle une API de modèle de langage (Claude, Gemini, ou autre) dans le cadre du traitement de contenu pédagogique. Ne code jamais un appel direct à une API IA sans passer par la logique de routage et le workflow de validation décrits ici.
---

# Pipeline de construction des agents IA de la plateforme

## Principe fondateur : le catalogue humain vient toujours avant le prompt

Un agent IA de structuration de cours ne peut classer correctement un contenu que si le catalogue des types d'éléments pédagogiques de la matière existe déjà (théorème, définition, exemple, exercice — voir cahier des charges Partie 2, section 16.0). Ce catalogue est un travail humain (enseignants + équipe pédagogique), jamais généré par l'IA elle-même.

Si tu codes un agent de structuration pour une matière sans catalogue préexistant dans `content_catalog`, arrête-toi et signale-le — ne laisse pas l'agent inventer sa propre classification à la volée.

## Un agent IA ici est un pipeline, pas un simple appel API

```
Fichier/donnée reçue
  → 1. Choix du fournisseur selon la tâche (voir table de routage ci-dessous)
  → 2. Construction du prompt incluant le catalogue de la matière concernée
  → 3. Appel API
  → 4. Validation de la structure de la réponse (schema check, pas de confiance aveugle)
  → 5. Sauvegarde en base avec statut "en_attente_de_validation"
  → 6. Jamais de publication automatique — toujours soumis au workflow humain
     (voir skill content-validation-workflow)
```

## Table de routage par tâche — ne jamais coder en dur un seul fournisseur pour tout

| Tâche | Fournisseur recommandé | Justification |
|---|---|---|
| Structuration de cours | Claude (Sonnet) | Nuance et fiabilité, volume plus faible |
| Génération d'exercices | Claude (Sonnet) | Qualité pédagogique prioritaire |
| Modération du forum | Gemini (Flash/Flash-Lite) | Haut volume, tâche de classification plus simple |
| OCR de scans manuscrits | Gemini (multimodal natif) | Gère nativement l'image, économique à volume élevé |

Cette table vit dans la configuration applicative (variable d'environnement ou table de config), jamais figée en dur dans le code — les prix et capacités des modèles changent trop vite pour être codés en constante.

**Si un nouveau fournisseur est ajouté (ex : DeepSeek)**, il doit d'abord être justifié pour une tâche précise avec une vraie raison (coût, latence, capacité spécifique) avant d'entrer dans cette table — ne jamais ajouter un fournisseur "parce qu'il est disponible" sans tâche cible identifiée.

## Traitement asynchrone obligatoire pour tout traitement en masse

Génération de 50 exercices ou structuration de 10 cours en même temps = traitement en arrière-plan avec notification à la fin, jamais une requête synchrone qui bloque l'interface. Le palier gratuit de Gemini a des limites de requêtes par minute — un pic d'usage (plusieurs enseignants uploadant en même temps à la rentrée) peut bloquer le service si le traitement est synchrone.

```js
// Mauvais : bloque l'utilisateur pendant potentiellement plusieurs minutes
const result = await generateExercises(chapterId, count: 50);

// Bon : renvoie immédiatement, traite en tâche de fond, notifie à la fin
await queueJob('generate_exercises', { chapterId, count: 50 });
// Le worker traite la file, insère en base, puis déclenche une notification
// via le skill notification-system une fois terminé
```

## Suivi des coûts — chaque appel doit être journalisé

```sql
insert into ai_agent_calls (agent_type, provider, tokens_used, cost_estimate)
values ('structuration_cours', 'claude', 4200, 0.063);
```

Ne code jamais un appel IA sans écrire dans `ai_agent_calls` juste après — sans ça, le tableau de bord de coûts (super_admin) n'a aucune donnée, et personne ne verra venir une dérive de coût avant la facture.

## Ce qu'il ne faut jamais faire

- Ne jamais laisser un agent publier directement un contenu — toujours via `validation_queue` (skill `content-validation-workflow`)
- Ne jamais appeler une API IA de façon synchrone pour un traitement en masse
- Ne jamais coder un fournisseur unique en dur — la table de routage doit rester modifiable
- Ne jamais faire confiance à la structure de la réponse IA sans validation de schéma — un modèle peut renvoyer un JSON malformé ou incomplet, surtout sur des tâches de structuration complexes
