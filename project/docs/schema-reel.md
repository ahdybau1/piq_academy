# Schéma réel de la base (source de vérité)

> **Ce fichier est la référence unique pour tout développement touchant la base de données.**
> Avant d'écrire du code (query, mutation, migration, type) qui touche une table, vérifie ce fichier plutôt que
> de deviner à partir de `cahier_des_charges_complet.md`, qui a pris du retard sur l'état réel de la base
> (voir « Écarts connus » en bas de page).
>
> Généré le 2026-07-04 à partir d'un export du schéma `public` (colonnes, types, nullabilité, valeurs par
> défaut, clés étrangères). **À mettre à jour à chaque migration qui modifie une table** — réexporter avec la
> requête dans `docs/schema-export-query.sql` et régénérer les tables concernées.

Toutes les tables ci-dessous sont dans le schéma `public`. Le schéma `auth` (utilisateurs, sessions Supabase
Auth) est géré par Supabase et n'est pas documenté ici — ne pas confondre `public.sessions` (session unique
stricte côté app élève) avec `auth.sessions` (sessions Supabase Auth internes).

## Sommaire

Identité & profils : [accounts](#accounts) · [profiles](#profiles) · [parent_accounts](#parent_accounts) ·
[parent_profile_links](#parent_profile_links) · [sessions](#sessions)

Arbre académique & contenu : [academic_nodes](#academic_nodes) · [subjects](#subjects) ·
[subject_class_links](#subject_class_links) · [terms](#terms) · [chapters](#chapters) · [lessons](#lessons) ·
[exercises](#exercises) · [exercise_versions](#exercise_versions) · [content_catalog](#content_catalog) ·
[content_versions](#content_versions) · [media_library](#media_library) · [validation_queue](#validation_queue)

Abonnements & paiements : [subscription_tiers](#subscription_tiers) ·
[subscription_tier_price_history](#subscription_tier_price_history) · [access_matrix](#access_matrix) ·
[subscriptions](#subscriptions) · [monthly_spend_counter](#monthly_spend_counter) ·
[transactions](#transactions) · [payment_reconciliation](#payment_reconciliation) ·
[refund_requests](#refund_requests) · [referral_codes](#referral_codes)

Notifications : [notification_templates](#notification_templates) · [notification_log](#notification_log) ·
[scheduled_reminders](#scheduled_reminders)

Examens, établissements, événements : [official_exams](#official_exams) · [exam_papers](#exam_papers) ·
[establishments](#establishments) · [establishment_papers](#establishment_papers) · [events](#events) ·
[event_results](#event_results) · [grade_disputes](#grade_disputes)

Communauté & support : [forum_threads](#forum_threads) · [forum_posts](#forum_posts) ·
[whatsapp_communities](#whatsapp_communities) · [support_tickets](#support_tickets)

Administration & audit : [admin_users](#admin_users) · [admin_permissions](#admin_permissions) ·
[audit_log](#audit_log) · [teacher_establishments](#teacher_establishments) ·
[service_health_log](#service_health_log) · [generated_documents](#generated_documents)

IA : [ai_agent_calls](#ai_agent_calls) · [ai_content_review](#ai_content_review)

Internationalisation (non documentée dans le cahier des charges) : [languages](#languages) ·
[country_languages](#country_languages) · [content_translations](#content_translations) ·
[content_translation_classes](#content_translation_classes)

---

## Identité & profils

### accounts
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | — | — |
| email | character varying | NO | — | — |
| phone | character varying | YES | — | — |
| first_name | character varying | YES | — | — |
| last_name | character varying | YES | — | — |
| preferred_language_id | uuid | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |
| status | text | NO | 'actif' | — |

### profiles
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| account_id | uuid | NO | — | accounts.id |
| class_node_id | uuid | NO | — | academic_nodes.id |
| subscription_tier | character varying | YES | 'gratuit' | — |
| status | character varying | YES | 'actif' | — |
| school_year | character varying | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### parent_accounts
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | — | — |
| email | character varying | NO | — | — |
| phone | character varying | YES | — | — |
| first_name | character varying | YES | — | — |
| last_name | character varying | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### parent_profile_links
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| parent_account_id | uuid | NO | — | parent_accounts.id |
| profile_id | uuid | NO | — | profiles.id |
| relation_type | character varying | YES | 'parent' | — |
| created_at | timestamp with time zone | YES | now() | — |

### sessions
Session unique stricte côté app élève — à ne pas confondre avec `auth.sessions` (Supabase Auth).
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| account_id | uuid | NO | — | — |
| device_fingerprint | text | YES | — | — |
| platform | character varying | YES | — | — |
| is_active | boolean | YES | true | — |
| created_at | timestamp with time zone | YES | now() | — |

---

## Arbre académique & contenu

### academic_nodes
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| parent_id | uuid | YES | — | academic_nodes.id (self) |
| node_type | character varying | NO | — | — |
| name | character varying | NO | — | — |
| country_id | uuid | YES | — | — |
| display_order | integer | YES | 0 | — |
| is_active | boolean | YES | true | — |
| created_at | timestamp with time zone | YES | now() | — |

### subjects
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| name | character varying | NO | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### subject_class_links
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| subject_id | uuid | NO | — | subjects.id |
| class_node_id | uuid | NO | — | academic_nodes.id |

### terms
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| country_id | uuid | NO | — | — |
| name | character varying | NO | — | — |
| start_date | date | NO | — | — |
| end_date | date | NO | — | — |

### chapters
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| subject_id | uuid | NO | — | subjects.id |
| term_id | uuid | YES | — | terms.id |
| title | character varying | NO | — | — |
| introduction | text | YES | — | — |
| display_order | integer | YES | 0 | — |
| created_at | timestamp with time zone | YES | now() | — |

### lessons
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| chapter_id | uuid | NO | — | chapters.id |
| title | character varying | NO | — | — |
| content_json | jsonb | YES | — | — |
| display_order | integer | YES | 0 | — |
| created_at | timestamp with time zone | YES | now() | — |
| updated_at | timestamp with time zone | YES | now() | — |

### exercises
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| lesson_id | uuid | YES | — | lessons.id |
| chapter_id | uuid | YES | — | chapters.id |
| type | character varying | NO | — | — |
| difficulty | character varying | YES | — | — |
| content_json | jsonb | YES | — | — |
| min_subscription_tier | character varying | YES | 'gratuit' | — |
| created_at | timestamp with time zone | YES | now() | — |

### exercise_versions
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| exercise_id | uuid | NO | — | exercises.id |
| version_number | integer | NO | — | — |
| content_json | jsonb | NO | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### content_catalog
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| subject_id | uuid | NO | — | subjects.id |
| element_type | character varying | NO | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### content_versions
Historique de versioning générique (indépendant de `exercise_versions`) ; `content_id` n'a pas de FK déclarée
(référence polymorphe selon `content_type` ailleurs).
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| content_id | uuid | NO | — | — |
| version_number | integer | NO | — | — |
| content_json | jsonb | NO | — | — |
| status | character varying | NO | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### media_library
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| type | character varying | NO | — | — |
| url | text | NO | — | — |
| uploaded_by | uuid | YES | — | admin_users.id |
| created_at | timestamp with time zone | YES | now() | — |

### validation_queue
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| content_type | character varying | NO | — | — |
| content_id | uuid | NO | — | — |
| status | character varying | NO | 'en_attente_de_validation' | — |
| submitted_by | uuid | YES | — | admin_users.id |
| reviewed_by | uuid | YES | — | admin_users.id |
| rejection_reason | text | YES | — | — |
| ai_report_json | jsonb | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |
| reviewed_at | timestamp with time zone | YES | — | — |

---

## Abonnements & paiements

### subscription_tiers
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| name | character varying | NO | — | — |
| class_node_id | uuid | YES | — | academic_nodes.id |
| price | numeric | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### subscription_tier_price_history
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| tier_id | uuid | NO | — | subscription_tiers.id |
| old_price | numeric | YES | — | — |
| new_price | numeric | NO | — | — |
| changed_by | uuid | YES | — | admin_users.id |
| changed_at | timestamp with time zone | YES | now() | — |

### access_matrix
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| tier_id | uuid | NO | — | subscription_tiers.id |
| feature_key | character varying | NO | — | — |
| access_level | character varying | NO | 'aucun' | — |
| limit_value | integer | YES | — | — |

### subscriptions
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| profile_id | uuid | NO | — | profiles.id |
| tier_id | uuid | NO | — | subscription_tiers.id |
| status | character varying | YES | 'actif' | — |
| start_date | date | NO | — | — |
| end_date | date | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### monthly_spend_counter
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| profile_id | uuid | NO | — | profiles.id |
| month | character varying | NO | — | — |
| cumulative_amount | numeric | YES | 0 | — |
| locked_threshold | numeric | YES | — | — |

### transactions
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| profile_id | uuid | NO | — | profiles.id |
| amount | numeric | NO | — | — |
| operator | character varying | YES | — | — |
| status | character varying | YES | 'en_attente' | — |
| aggregator_ref | character varying | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### payment_reconciliation
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| transaction_id | uuid | NO | — | transactions.id |
| issue_type | character varying | YES | — | — |
| resolved_by | uuid | YES | — | admin_users.id |
| resolved_at | timestamp with time zone | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### refund_requests
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| profile_id | uuid | NO | — | profiles.id |
| reason_category | character varying | NO | — | — |
| motive | text | YES | — | — |
| status | character varying | YES | 'en_attente' | — |
| decided_by | uuid | YES | — | admin_users.id |
| decision_reason | text | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### referral_codes
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| profile_id | uuid | NO | — | profiles.id |
| code | character varying | NO | — | — |
| uses_count | integer | YES | 0 | — |
| created_at | timestamp with time zone | YES | now() | — |

---

## Notifications

### notification_templates
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| event_key | character varying | NO | — | — |
| channel | character varying | NO | — | — |
| language_id | uuid | YES | — | — |
| title_template | text | YES | — | — |
| body_template | text | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### notification_log
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| profile_id | uuid | YES | — | profiles.id |
| template_id | uuid | YES | — | notification_templates.id |
| sent_at | timestamp with time zone | YES | now() | — |
| opened_at | timestamp with time zone | YES | — | — |

### scheduled_reminders
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| profile_id | uuid | NO | — | profiles.id |
| reminder_type | character varying | NO | — | — |
| trigger_date | date | NO | — | — |
| sent | boolean | YES | false | — |

---

## Examens, établissements, événements

### official_exams
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| country_id | uuid | NO | — | — |
| class_node_id | uuid | NO | — | academic_nodes.id |
| name | character varying | NO | — | — |
| exam_date | date | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### exam_papers
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| exam_id | uuid | NO | — | official_exams.id |
| subject_id | uuid | NO | — | subjects.id |
| year | integer | NO | — | — |
| document_url | text | YES | — | — |
| correction_url | text | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### establishments
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| country_id | uuid | NO | — | — |
| name | character varying | NO | — | — |
| city | character varying | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### establishment_papers
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| establishment_id | uuid | NO | — | establishments.id |
| class_node_id | uuid | NO | — | academic_nodes.id |
| subject_id | uuid | NO | — | subjects.id |
| year | integer | NO | — | — |
| document_url | text | YES | — | — |
| correction_url | text | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### events
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| type | character varying | NO | — | — |
| country_id | uuid | YES | — | — |
| start_date | timestamp with time zone | YES | — | — |
| end_date | timestamp with time zone | YES | — | — |
| pricing_mode | character varying | YES | 'inclus' | — |
| created_at | timestamp with time zone | YES | now() | — |

### event_results
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| event_id | uuid | NO | — | events.id |
| profile_id | uuid | NO | — | profiles.id |
| score | numeric | YES | — | — |
| rank | integer | YES | — | — |
| percentile | numeric | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### grade_disputes
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| event_result_id | uuid | NO | — | event_results.id |
| reason | text | NO | — | — |
| status | character varying | YES | 'ouvert' | — |
| resolution | text | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

---

## Communauté & support

### forum_threads
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| class_node_id | uuid | NO | — | academic_nodes.id |
| subject_id | uuid | YES | — | subjects.id |
| title | character varying | NO | — | — |
| created_by | uuid | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### forum_posts
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| thread_id | uuid | NO | — | forum_threads.id |
| author_id | uuid | YES | — | — |
| content | text | NO | — | — |
| flagged | boolean | YES | false | — |
| created_at | timestamp with time zone | YES | now() | — |

### whatsapp_communities
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| class_node_id | uuid | NO | — | academic_nodes.id |
| invite_link | text | NO | — | — |
| member_count_estimate | integer | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### support_tickets
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| account_id | uuid | YES | — | — |
| category | character varying | NO | — | — |
| status | character varying | YES | 'ouvert' | — |
| requester_type | character varying | YES | 'eleve' | — |
| created_at | timestamp with time zone | YES | now() | — |
| sla_deadline | timestamp with time zone | YES | — | — |
| escalated | boolean | YES | false | — |
| escalated_at | timestamp with time zone | YES | — | — |

---

## Administration & audit

### admin_users
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | — | — |
| email | character varying | NO | — | — |
| role | character varying | NO | — | — |
| scope_json | jsonb | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### admin_permissions
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| admin_user_id | uuid | NO | — | admin_users.id |
| permission_key | character varying | NO | — | — |
| granted | boolean | YES | true | — |

### audit_log
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| admin_user_id | uuid | YES | — | admin_users.id |
| action_type | character varying | NO | — | — |
| entity_type | character varying | NO | — | — |
| entity_id | uuid | NO | — | — |
| before_json | jsonb | YES | — | — |
| after_json | jsonb | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### teacher_establishments
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| teacher_id | uuid | NO | — | admin_users.id |
| establishment_id | uuid | NO | — | establishments.id |
| subjects_scope | jsonb | YES | — | — |
| classes_scope | jsonb | YES | — | — |

### service_health_log
Non documentée dans le cahier des charges — alimente probablement `config/services`.
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| service_name | character varying | NO | — | — |
| status | character varying | NO | — | — |
| detail | text | YES | — | — |
| checked_at | timestamp with time zone | YES | now() | — |

### generated_documents
Non documentée dans le cahier des charges — probablement les reçus automatiques (section 12, dons).
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| profile_id | uuid | YES | — | profiles.id |
| document_type | character varying | NO | — | — |
| generated_at | timestamp with time zone | YES | now() | — |
| generated_by | uuid | YES | — | admin_users.id |

---

## IA

Non documentées dans le cahier des charges — alimentent probablement `ai/agents` et `ai/costs`.

### ai_agent_calls
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| agent_type | character varying | NO | — | — |
| provider | character varying | NO | — | — |
| tokens_used | integer | YES | — | — |
| cost_estimate | numeric | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### ai_content_review
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| content_id | uuid | NO | — | — |
| ai_findings_json | jsonb | YES | — | — |
| accepted | boolean | YES | — | — |
| reviewed_by | uuid | YES | — | admin_users.id |
| created_at | timestamp with time zone | YES | now() | — |

---

## Internationalisation

Non documentées dans le cahier des charges (la Partie 4/36 ne couvre pas l'i18n) — pertinentes pour le skill
`i18n-localization` et les écrans `system/translations`.

### languages
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| code | character varying | NO | — | — |
| name | character varying | NO | — | — |
| name_en | character varying | YES | — | — |
| is_active | boolean | YES | true | — |
| is_rtl | boolean | YES | false | — |
| fallback_language | character varying | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### country_languages
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| country_id | uuid | NO | — | — |
| language_id | uuid | NO | — | languages.id |
| is_default | boolean | YES | false | — |
| region_codes | jsonb | YES | — | — |
| created_at | timestamp with time zone | YES | now() | — |

### content_translations
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| content_type | character varying | NO | — | — |
| content_id | uuid | NO | — | — |
| language_id | uuid | NO | — | languages.id |
| status | character varying | YES | 'draft' | — |
| version_number | integer | YES | 1 | — |
| translated_by | uuid | YES | — | admin_users.id |
| reviewed_by | uuid | YES | — | admin_users.id |
| assigned_to | uuid | YES | — | admin_users.id |
| created_at | timestamp with time zone | YES | now() | — |
| published_at | timestamp with time zone | YES | — | — |

### content_translation_classes
| Colonne | Type | Nullable | Défaut | Référence |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | — |
| translation_id | uuid | NO | — | content_translations.id |
| class_node_id | uuid | NO | — | academic_nodes.id |

---

## Écarts connus avec `cahier_des_charges_complet.md`

- **`accounts`** : pas de `password_hash` (les identifiants vivent dans `auth.users`, gérés par Supabase Auth
  — jamais dupliqués côté `public.accounts`), pas de `photo_url`. A en revanche `preferred_language_id`
  (non documenté) et `status` (ajouté en migration `20260704120000_accounts_status.sql`, section 5.1).
- **Tables absentes du cahier des charges** mais présentes en base : `ai_agent_calls`, `ai_content_review`,
  `content_translations`, `content_translation_classes`, `content_versions`, `country_languages`,
  `generated_documents`, `languages`, `service_health_log`, `subscription_tier_price_history`. Probablement
  ajoutées après la rédaction du cahier des charges pour l'i18n, le suivi IA et l'historique tarifaire — à
  confirmer avec le porteur du projet si leur usage exact devient ambigu.
- Aucune table de suivi de progression détaillée (leçons/exercices complétés, scores par exercice) n'existe
  encore — cf. section 5.2 (« historique de progression détaillé ») dans l'app admin, actuellement affichée
  comme indisponible faute de table.
