# PIQ Academy — Instructions pour Claude Code

## Ordre de priorité des projets — À RESPECTER STRICTEMENT

Ce dépôt contient à terme deux applications : l'Application Élève et l'Application Administration.

**La première application à développer, et la SEULE sur laquelle travailler pour l'instant, est l'Application Administration.**

Ne commence aucun écran, composant ou route lié à l'Application Élève tant que l'Administration n'est pas fonctionnelle et validée. Si une tâche semble nécessiter du travail côté Élève, arrête-toi et signale-le plutôt que de l'entreprendre.

## Document de référence

Le cahier des charges complet du projet se trouve dans `cahier_des_charges_complet.md` à la racine de ce dépôt. Il couvre les deux applications, l'architecture technique, le modèle de données et des exemples métier détaillés.

Pour toute tâche sur l'Application Administration, réfère-toi en priorité à :
- Partie 2 — Application Administration (les 30 sections fonctionnelles)
- Partie 4 — Modèle de données détaillé
- Partie 5 — Logique détaillée et exemples chiffrés (comportements exacts attendus)

## Stack technique imposée

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase (PostgreSQL, Auth, Edge Functions). Ne propose pas d'autre stack — elle a déjà été choisie et la base de données est déjà construite dessus.

## Base de données

Le schéma Supabase existe déjà (50 tables, Row Level Security actif sur toutes, triggers de cumul d'abonnement et d'audit déjà testés et fonctionnels). Ne recrée jamais une table existante. Si une table ou une colonne semble manquante pour une fonctionnalité, signale-le avant de modifier le schéma toi-même.

## Skills à utiliser en priorité pour cette phase (Application Administration)

Les skills suivants sont directement pertinents pour le travail en cours. Applique-les sans qu'on ait besoin de te le rappeler à chaque tâche :

- `academic-tree-model` — manipulation de l'arbre académique générique
- `rls-policies-admin-eleve` — toute nouvelle table ou route doit avoir ses policies RLS
- `content-validation-workflow` — aucun contenu ne se publie sans passer par la file de validation
- `audit-logging` — toute action admin sensible doit être tracée
- `subscription-access-control` — jamais de vérification de palier codée en dur
- `mobile-money-payment-flow` — si la tâche touche aux paiements
- `notification-system` — si la tâche déclenche une notification
- `ai-content-pipeline` — si la tâche construit un agent IA (structuration, modération, OCR)
- `database-migrations` — toute modification de schéma passe par une migration versionnée, jamais du SQL ad hoc
- `security-review` — avant de considérer une fonctionnalité terminée
- `nextjs-supabase-auth`, `next-best-practices`, `react-best-practices`, `shadcn`, `nextjs-shadcn` — conventions de code pour cette stack

Les autres skills disponibles (i18n, PDF, design, optimisation, etc.) restent accessibles mais concernent des besoins qui viendront après ce premier périmètre — ne les active pas de façon spéculative sur des tâches qui ne les nécessitent pas.

## Périmètre fonctionnel de ce premier cycle de développement

Ne construis que ce qui suit, dans cet ordre :
1. CRUD de l'arbre académique (pays, section, classe, série)
2. Gestion des comptes et profils
3. File de validation de contenu pédagogique

Tout le reste des 30 sections de la Partie 2 attend que ces trois premiers écrans soient fonctionnels et testés.

## Ce qu'il ne faut jamais faire

- Ne jamais construire plusieurs fonctionnalités en parallèle sans validation intermédiaire
- Ne jamais exposer de données financières à un rôle autre que `super_admin`
- Ne jamais publier de contenu sans passage par le workflow de validation
- Ne jamais supposer une règle métier non écrite dans le cahier des charges — demander plutôt que deviner






<!-- cloude-code-toolbox:mcp-skills-awareness-begin -->

### MCP & Skills awareness (Cloude Code ToolBox)

_Last synced: 2026-07-04T14:40:46.891Z._

- **Full report:** `.claude/cloude-code-toolbox-mcp-skills-awareness.md` in this workspace (auto-overwritten on each scan). Use it as ground truth for configured servers and skill folders.
- **MCP:** For **live tools** in Claude Code, enable the matching server via `/mcp`. Servers are configured in `~/.claude.json` (user) and `.mcp.json` (project).
- **When the user’s task matches a server** (e.g. Confluence work and a **Confluence** / **Atlassian** MCP is listed), **prefer that server id** and plan on tool use—not only file search.
- **Skills:** Folders below contain `SKILL.md`; attach or cite paths in chat when relevant.

#### Workspace MCP

- `c:\Users\ahouf\Desktop\piq\.mcp.json` _(workspace: piq)_ — _file missing_

_No active workspace servers in mcp.json._

#### User MCP

- `C:\Users\ahouf\.claude.json` — _no servers defined_

_No active user-scoped servers in mcp.json._

#### Project skills

_None found (or no workspace open)._

#### User skills

- **academic-tree-model** — `C:\Users\ahouf\.claude\skills\academic-tree-model` — Utilise ce skill dès que tu crées, modifies ou interroges quoi que ce soit lié à l'arbre académique (pays, section, type d'enseignement, classe, série) ou aux matières/chapitres/leçons qui s'y rattachent. Applique-le sys

- **accessibility** — `C:\Users\ahouf\.claude\skills\accessibility` — Design, implement, and audit inclusive digital products using WCAG 2.2 Level AA

- **ai-content-pipeline** — `C:\Users\ahouf\.claude\skills\ai-content-pipeline` — Utilise ce skill dès que tu construis un agent IA pour l'application (structuration de cours, génération d'exercices, modération du forum, OCR de scans). Applique-le pour toute fonction qui appelle une API de modèle de l

- **ai-sdk** — `C:\Users\ahouf\.claude\skills\ai-sdk` — Answer questions about the AI SDK and help build AI-powered features. Use when developers ask about Vercel AI SDK, generateText, streamText, ToolLoopAgent, useChat, providers, tools, structured output, embeddings, stream

- **api-design** — `C:\Users\ahouf\.claude\skills\api-design` — REST API design patterns including resource naming, status codes, pagination, filtering, error responses, versioning, and rate limiting for production APIs.

- **architecture-decision-records** — `C:\Users\ahouf\.claude\skills\architecture-decision-records` — Capture architectural decisions made during Claude Code sessions as structured ADRs. Auto-detects decision moments, records context, alternatives considered, and rationale. Maintains an ADR log so future developers under

- **audit-logging** — `C:\Users\ahouf\.claude\skills\audit-logging` — Applique ce skill à chaque action administrative sensible que tu codes — création, modification, suspension, suppression d'un compte, d'un contenu, d'un rôle, d'une configuration. Le Super-admin doit pouvoir retrouver to

- **auth-implementation-patterns** — `C:\Users\ahouf\.claude\skills\auth-implementation-patterns` — Build secure, scalable authentication and authorization systems using industry-standard patterns and modern best practices.

- **backend-patterns** — `C:\Users\ahouf\.claude\skills\backend-patterns` — Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes.

- **broken-authentication** — `C:\Users\ahouf\.claude\skills\broken-authentication` — Identify and exploit authentication and session management vulnerabilities in web applications. Broken authentication consistently ranks in the OWASP Top 10 and can lead to account takeover, identity theft, and unauthori

- **browser-qa** — `C:\Users\ahouf\.claude\skills\browser-qa` — Use this skill to automate visual testing and UI interaction verification using browser automation after deploying features.

- **cache-components** — `C:\Users\ahouf\.claude\skills\cache-components` — Expert guidance for Next.js Cache Components and Partial Prerendering (PPR). Use when implementing 'use cache' directive, configuring cache lifetimes with cacheLife(), tagging cached data with cacheTag(), invalidating ca

- **chrome-devtools** — `C:\Users\ahouf\.claude\skills\chrome-devtools` — Tests in real browsers via Chrome DevTools MCP. Use when building or debugging anything that runs in a browser. Use when you need to inspect the DOM, capture console errors, analyze network requests, profile performance 

- **claude-api** — `C:\Users\ahouf\.claude\skills\claude-api` — Anthropic Claude API patterns for Python and TypeScript. Covers Messages API, streaming, tool use, vision, extended thinking, batches, prompt caching, and Claude Agent SDK. Use when building applications with the Claude 

- **code-tour** — `C:\Users\ahouf\.claude\skills\code-tour` — Create CodeTour `.tour` files — persona-targeted, step-by-step walkthroughs with real file and line anchors. Use for onboarding tours, architecture walkthroughs, PR tours, RCA tours, and structured "explain how this work

- **codebase-onboarding** — `C:\Users\ahouf\.claude\skills\codebase-onboarding` — Analyze an unfamiliar codebase and generate a structured onboarding guide with architecture map, key entry points, conventions, and a starter CLAUDE.md. Use when joining a new project or setting up Claude Code for the fi

- **coding-standards** — `C:\Users\ahouf\.claude\skills\coding-standards` — Baseline cross-project coding conventions for naming, readability, immutability, and code-quality review. Use detailed frontend or backend skills for framework-specific patterns.

- **competitor-profiling** — `C:\Users\ahouf\.claude\skills\competitor-profiling` — When the user wants to research, profile, or analyze competitors from their URLs. Also use when the user mentions 'competitor profile,' 'competitor research,' 'competitor analysis,' 'profile this competitor,' 'analyze co

- **content-hash-cache-pattern** — `C:\Users\ahouf\.claude\skills\content-hash-cache-pattern` — Cache expensive file processing results using SHA-256 content hashes — path-independent, auto-invalidating, with service layer separation.

- **content-validation-workflow** — `C:\Users\ahouf\.claude\skills\content-validation-workflow` — Utilise ce skill dès que tu implémentes la création, la modification ou la publication de contenu pédagogique (cours, chapitres, leçons, exercices) dans l'application admin. Applique-le aussi pour toute fonctionnalité li

- **dashboard-builder** — `C:\Users\ahouf\.claude\skills\dashboard-builder` — Build monitoring dashboards that answer real operator questions for Grafana, SigNoz, and similar platforms. Use when turning metrics into a working dashboard instead of a vanity board.

- **database-migrations** — `C:\Users\ahouf\.claude\skills\database-migrations` — Database migration best practices for schema changes, data migrations, rollbacks, and zero-downtime deployments across PostgreSQL, MySQL, and common ORMs (Prisma, Drizzle, Kysely, Django, TypeORM, golang-migrate).

- **deployment-patterns** — `C:\Users\ahouf\.claude\skills\deployment-patterns` — Deployment workflows, CI/CD pipeline patterns, Docker containerization, health checks, rollback strategies, and production readiness checklists for web applications.

- **design-consultation** — `C:\Users\ahouf\.claude\skills\design-consultation` — Design consultation: understands your product, researches the landscape, proposes a complete design system (aesthetic, typography, color, layout, spacing, motion), and generates font+color preview... (gstack)

- **design-system** — `C:\Users\ahouf\.claude\skills\design-system` — Use this skill to generate or audit design systems, check visual consistency, and review PRs that touch styling.

- **docker-patterns** — `C:\Users\ahouf\.claude\skills\docker-patterns` — Docker and Docker Compose patterns for local development, container security, networking, volume strategies, and multi-service orchestration.

- **documentation-lookup** — `C:\Users\ahouf\.claude\skills\documentation-lookup` — Use up-to-date library and framework docs via Context7 MCP instead of training data. Activates for setup questions, API references, code examples, or when the user names a framework (e.g. React, Next.js, Prisma).

- **e2e-testing** — `C:\Users\ahouf\.claude\skills\e2e-testing` — Playwright E2E testing patterns, Page Object Model, configuration, CI/CD integration, artifact management, and flaky test strategies.

- **frontend-design** — `C:\Users\ahouf\.claude\skills\frontend-design` — Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing

- **frontend-patterns** — `C:\Users\ahouf\.claude\skills\frontend-patterns` — Frontend development patterns for React, Next.js, state management, performance optimization, and UI best practices.

- **git-workflow** — `C:\Users\ahouf\.claude\skills\git-workflow` — Git workflow patterns including branching strategies, commit conventions, merge vs rebase, conflict resolution, and collaborative development best practices for teams of all sizes.

- **github-ops** — `C:\Users\ahouf\.claude\skills\github-ops` — GitHub repository operations, automation, and management. Issue triage, PR management, CI/CD operations, release management, and security monitoring using the gh CLI. Use when the user wants to manage GitHub issues, PRs,

- **handoff** — `C:\Users\ahouf\.claude\skills\handoff` — Write or update a HANDOFF.md so a fresh agent can continue this work. Use when the user says "handoff", "compact this", "context is full", or "/clear and continue".

- **i18n-localization** — `C:\Users\ahouf\.claude\skills\i18n-localization` — Internationalization and localization patterns. Detecting hardcoded strings, managing translations, locale files, RTL support.

- **make-pdf** — `C:\Users\ahouf\.claude\skills\make-pdf` — Turn any markdown file into a publication-quality PDF. (gstack)

- **mcp-server-patterns** — `C:\Users\ahouf\.claude\skills\mcp-server-patterns` — Build MCP servers with Node/TypeScript SDK — tools, resources, prompts, Zod validation, stdio vs Streamable HTTP. Use Context7 or official MCP docs for latest API.

- **mobile-money-payment-flow** — `C:\Users\ahouf\.claude\skills\mobile-money-payment-flow` — Utilise ce skill dès que tu codes l'initiation d'un paiement, la réception d'un webhook de l'agrégateur (Campay, Notch Pay, Monetbil), ou la réconciliation d'une transaction ambiguë. Applique-le aussi pour tout ce qui to

- **next-best-practices** — `C:\Users\ahouf\.claude\skills\next-best-practices` — Next.js App Router best practices covering file conventions, RSC boundaries, async APIs, data patterns, hydration errors, metadata, route handlers, image/font optimization, and bundling. Use when writing or reviewing Nex

- **nextjs-app-router-patterns** — `C:\Users\ahouf\.claude\skills\nextjs-app-router-patterns` — Comprehensive patterns for Next.js 14+ App Router architecture, Server Components, and modern full-stack React development.

- **nextjs-shadcn** — `C:\Users\ahouf\.claude\skills\nextjs-shadcn` — Creates Next.js frontends with shadcn/ui. Use when building React UIs, components, pages, or applications with shadcn, Tailwind, or modern frontend patterns. Also use when the user asks to create a new Next.js project, a

- **nextjs-supabase-auth** — `C:\Users\ahouf\.claude\skills\nextjs-supabase-auth` — Expert integration of Supabase Auth with Next.js App Router

- **nextjs-turbopack** — `C:\Users\ahouf\.claude\skills\nextjs-turbopack` — Next.js 16+ and Turbopack — incremental bundling, FS caching, dev speed, and when to use Turbopack vs webpack.

- **notification-system** — `C:\Users\ahouf\.claude\skills\notification-system` — Utilise ce skill dès que tu codes l'envoi d'une notification (push, email, SMS, in-app), la gestion des templates de notification, ou tout déclencheur automatique lié à un événement (expiration d'abonnement, contenu publ

- **nutrient-document-processing** — `C:\Users\ahouf\.claude\skills\nutrient-document-processing` — Process, convert, OCR, extract, redact, sign, and fill documents using the Nutrient DWS API. Works with PDFs, DOCX, XLSX, PPTX, HTML, and images.

- **postgres-patterns** — `C:\Users\ahouf\.claude\skills\postgres-patterns` — PostgreSQL database patterns for query optimization, schema design, indexing, and security. Based on Supabase best practices.

- **prompt-optimizer** — `C:\Users\ahouf\.claude\skills\prompt-optimizer` — >-

- **react-best-practices** — `C:\Users\ahouf\.claude\skills\react-best-practices` — React and Next.js performance optimization guide from Vercel Engineering (70 rules in 8 categories). Use when writing, reviewing, or refactoring React/Next.js code to eliminate waterfalls, reduce bundle size, prevent re-

- **repo-scan** — `C:\Users\ahouf\.claude\skills\repo-scan` — Cross-stack source code asset audit — classifies every file, detects embedded third-party libraries, and delivers actionable four-level verdicts per module with interactive HTML reports.

- **rls-policies-admin-eleve** — `C:\Users\ahouf\.claude\skills\rls-policies-admin-eleve` — Applique ce skill à chaque fois que tu crées une table, une fonction Supabase, ou une route API dans ce projet. La sécurité repose entièrement sur Row Level Security au niveau base de données, pas sur des vérifications c

- **security-review** — `C:\Users\ahouf\.claude\skills\security-review` — Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, or implementing payment/sensitive features. Provides comprehensive security checklist and patterns.

- **security-scan** — `C:\Users\ahouf\.claude\skills\security-scan` — Scan your Claude Code configuration (.claude/ directory) for security vulnerabilities, misconfigurations, and injection risks using AgentShield. Checks CLAUDE.md, settings.json, MCP servers, hooks, and agent definitions.

- **shadcn** — `C:\Users\ahouf\.claude\skills\shadcn` — Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI. Provides project context, component docs, and usage examples. Applies when working with shadcn/ui, component regis

- **subscription-access-control** — `C:\Users\ahouf\.claude\skills\subscription-access-control` — Utilise ce skill dès que tu codes une vérification d'accès à une fonctionnalité ou un contenu selon le palier d'abonnement (gratuit/journalier/hebdomadaire/mensuel/annuel). Applique-le pour tout écran ou route API qui dé

- **supabase-postgres-best-practices** — `C:\Users\ahouf\.claude\skills\supabase-postgres-best-practices` — Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations.

- **tdd-workflow** — `C:\Users\ahouf\.claude\skills\tdd-workflow` — Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage including unit, integration, and E2E tests.

- **terminal-ops** — `C:\Users\ahouf\.claude\skills\terminal-ops` — Evidence-first repo execution workflow for ECC. Use when the user wants a command run, a repo checked, a CI failure debugged, or a narrow fix pushed with exact proof of what was executed and verified.

- **vercel-optimize** — `C:\Users\ahouf\.claude\skills\vercel-optimize` — Audit deployed Vercel apps for cost and performance issues using metrics, project config, code scans, and version-aware recommendations.

- **verification-loop** — `C:\Users\ahouf\.claude\skills\verification-loop` — A comprehensive verification system for Claude Code sessions.

- **web-design-guidelines** — `C:\Users\ahouf\.claude\skills\web-design-guidelines` — Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".

<!-- cloude-code-toolbox:mcp-skills-awareness-end -->
