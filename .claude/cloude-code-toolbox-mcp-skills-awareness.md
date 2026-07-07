# Cloude Code ToolBox — MCP & Skills awareness

_Generated: 2026-07-06T18:46:33.047Z_

## How to use this report

- **Saved copy:** This file is **`.claude/cloude-code-toolbox-mcp-skills-awareness.md`** — refreshed whenever the toolbox runs an MCP & Skills scan (including on workspace open when auto-scan is enabled). It is meant for **Claude Code workspace context** together with `CLAUDE.md` (which gets a shorter replaceable summary when auto-merge is on).
- **MCP:** Lists **configured** servers from Claude Code config (`~/.claude.json` for user scope, `.mcp.json` for project scope). Use `/mcp` in the Claude Code panel to connect servers for your session.
- **Skills:** **On-disk** folders with `SKILL.md`. Claude Code does not auto-load them; attach `SKILL.md` or paths in chat when useful.
- **Task routing:** When the user’s request matches a server’s purpose (e.g. Confluence → Confluence/Atlassian MCP), prefer that **server id** from the tables below.

---

## MCP — workspace

Workspace `mcp.json` _(folder: piq)_

- **c:\Users\ahouf\Desktop\piq\.mcp.json** — _File missing_

_No active workspace servers in mcp.json._

## MCP — user profile

- **C:\Users\ahouf\.claude.json** — _File exists — no servers defined_

_No active user-scoped servers in mcp.json._

## Skills (local `SKILL.md` folders)

### Project-scoped

_None found (or no workspace open)._

### User-scoped

- **academic-tree-model** — `C:\Users\ahouf\.claude\skills\academic-tree-model`
  - Utilise ce skill dès que tu crées, modifies ou interroges quoi que ce soit lié à l'arbre académique (pays, section, type d'enseignement, classe, série) ou aux matières/chapitres/leçons qui s'y rattachent. Applique-le sys

- **accessibility** — `C:\Users\ahouf\.claude\skills\accessibility`
  - Design, implement, and audit inclusive digital products using WCAG 2.2 Level AA

- **ai-content-pipeline** — `C:\Users\ahouf\.claude\skills\ai-content-pipeline`
  - Utilise ce skill dès que tu construis un agent IA pour l'application (structuration de cours, génération d'exercices, modération du forum, OCR de scans). Applique-le pour toute fonction qui appelle une API de modèle de l

- **ai-sdk** — `C:\Users\ahouf\.claude\skills\ai-sdk`
  - Answer questions about the AI SDK and help build AI-powered features. Use when developers ask about Vercel AI SDK, generateText, streamText, ToolLoopAgent, useChat, providers, tools, structured output, embeddings, stream

- **api-design** — `C:\Users\ahouf\.claude\skills\api-design`
  - REST API design patterns including resource naming, status codes, pagination, filtering, error responses, versioning, and rate limiting for production APIs.

- **architecture-decision-records** — `C:\Users\ahouf\.claude\skills\architecture-decision-records`
  - Capture architectural decisions made during Claude Code sessions as structured ADRs. Auto-detects decision moments, records context, alternatives considered, and rationale. Maintains an ADR log so future developers under

- **audit-logging** — `C:\Users\ahouf\.claude\skills\audit-logging`
  - Applique ce skill à chaque action administrative sensible que tu codes — création, modification, suspension, suppression d'un compte, d'un contenu, d'un rôle, d'une configuration. Le Super-admin doit pouvoir retrouver to

- **auth-implementation-patterns** — `C:\Users\ahouf\.claude\skills\auth-implementation-patterns`
  - Build secure, scalable authentication and authorization systems using industry-standard patterns and modern best practices.

- **backend-patterns** — `C:\Users\ahouf\.claude\skills\backend-patterns`
  - Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes.

- **broken-authentication** — `C:\Users\ahouf\.claude\skills\broken-authentication`
  - Identify and exploit authentication and session management vulnerabilities in web applications. Broken authentication consistently ranks in the OWASP Top 10 and can lead to account takeover, identity theft, and unauthori

- **browser-qa** — `C:\Users\ahouf\.claude\skills\browser-qa`
  - Use this skill to automate visual testing and UI interaction verification using browser automation after deploying features.

- **cache-components** — `C:\Users\ahouf\.claude\skills\cache-components`
  - Expert guidance for Next.js Cache Components and Partial Prerendering (PPR). Use when implementing 'use cache' directive, configuring cache lifetimes with cacheLife(), tagging cached data with cacheTag(), invalidating ca

- **chrome-devtools** — `C:\Users\ahouf\.claude\skills\chrome-devtools`
  - Tests in real browsers via Chrome DevTools MCP. Use when building or debugging anything that runs in a browser. Use when you need to inspect the DOM, capture console errors, analyze network requests, profile performance 

- **claude-api** — `C:\Users\ahouf\.claude\skills\claude-api`
  - Anthropic Claude API patterns for Python and TypeScript. Covers Messages API, streaming, tool use, vision, extended thinking, batches, prompt caching, and Claude Agent SDK. Use when building applications with the Claude 

- **code-tour** — `C:\Users\ahouf\.claude\skills\code-tour`
  - Create CodeTour `.tour` files — persona-targeted, step-by-step walkthroughs with real file and line anchors. Use for onboarding tours, architecture walkthroughs, PR tours, RCA tours, and structured "explain how this work

- **codebase-onboarding** — `C:\Users\ahouf\.claude\skills\codebase-onboarding`
  - Analyze an unfamiliar codebase and generate a structured onboarding guide with architecture map, key entry points, conventions, and a starter CLAUDE.md. Use when joining a new project or setting up Claude Code for the fi

- **coding-standards** — `C:\Users\ahouf\.claude\skills\coding-standards`
  - Baseline cross-project coding conventions for naming, readability, immutability, and code-quality review. Use detailed frontend or backend skills for framework-specific patterns.

- **competitor-profiling** — `C:\Users\ahouf\.claude\skills\competitor-profiling`
  - When the user wants to research, profile, or analyze competitors from their URLs. Also use when the user mentions 'competitor profile,' 'competitor research,' 'competitor analysis,' 'profile this competitor,' 'analyze co

- **content-hash-cache-pattern** — `C:\Users\ahouf\.claude\skills\content-hash-cache-pattern`
  - Cache expensive file processing results using SHA-256 content hashes — path-independent, auto-invalidating, with service layer separation.

- **content-validation-workflow** — `C:\Users\ahouf\.claude\skills\content-validation-workflow`
  - Utilise ce skill dès que tu implémentes la création, la modification ou la publication de contenu pédagogique (cours, chapitres, leçons, exercices) dans l'application admin. Applique-le aussi pour toute fonctionnalité li

- **dashboard-builder** — `C:\Users\ahouf\.claude\skills\dashboard-builder`
  - Build monitoring dashboards that answer real operator questions for Grafana, SigNoz, and similar platforms. Use when turning metrics into a working dashboard instead of a vanity board.

- **database-migrations** — `C:\Users\ahouf\.claude\skills\database-migrations`
  - Database migration best practices for schema changes, data migrations, rollbacks, and zero-downtime deployments across PostgreSQL, MySQL, and common ORMs (Prisma, Drizzle, Kysely, Django, TypeORM, golang-migrate).

- **deployment-patterns** — `C:\Users\ahouf\.claude\skills\deployment-patterns`
  - Deployment workflows, CI/CD pipeline patterns, Docker containerization, health checks, rollback strategies, and production readiness checklists for web applications.

- **design-consultation** — `C:\Users\ahouf\.claude\skills\design-consultation`
  - Design consultation: understands your product, researches the landscape, proposes a complete design system (aesthetic, typography, color, layout, spacing, motion), and generates font+color preview... (gstack)

- **design-system** — `C:\Users\ahouf\.claude\skills\design-system`
  - Use this skill to generate or audit design systems, check visual consistency, and review PRs that touch styling.

- **docker-patterns** — `C:\Users\ahouf\.claude\skills\docker-patterns`
  - Docker and Docker Compose patterns for local development, container security, networking, volume strategies, and multi-service orchestration.

- **documentation-lookup** — `C:\Users\ahouf\.claude\skills\documentation-lookup`
  - Use up-to-date library and framework docs via Context7 MCP instead of training data. Activates for setup questions, API references, code examples, or when the user names a framework (e.g. React, Next.js, Prisma).

- **e2e-testing** — `C:\Users\ahouf\.claude\skills\e2e-testing`
  - Playwright E2E testing patterns, Page Object Model, configuration, CI/CD integration, artifact management, and flaky test strategies.

- **frontend-design** — `C:\Users\ahouf\.claude\skills\frontend-design`
  - Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing

- **frontend-patterns** — `C:\Users\ahouf\.claude\skills\frontend-patterns`
  - Frontend development patterns for React, Next.js, state management, performance optimization, and UI best practices.

- **git-workflow** — `C:\Users\ahouf\.claude\skills\git-workflow`
  - Git workflow patterns including branching strategies, commit conventions, merge vs rebase, conflict resolution, and collaborative development best practices for teams of all sizes.

- **github-ops** — `C:\Users\ahouf\.claude\skills\github-ops`
  - GitHub repository operations, automation, and management. Issue triage, PR management, CI/CD operations, release management, and security monitoring using the gh CLI. Use when the user wants to manage GitHub issues, PRs,

- **handoff** — `C:\Users\ahouf\.claude\skills\handoff`
  - Write or update a HANDOFF.md so a fresh agent can continue this work. Use when the user says "handoff", "compact this", "context is full", or "/clear and continue".

- **i18n-localization** — `C:\Users\ahouf\.claude\skills\i18n-localization`
  - Internationalization and localization patterns. Detecting hardcoded strings, managing translations, locale files, RTL support.

- **make-pdf** — `C:\Users\ahouf\.claude\skills\make-pdf`
  - Turn any markdown file into a publication-quality PDF. (gstack)

- **mcp-server-patterns** — `C:\Users\ahouf\.claude\skills\mcp-server-patterns`
  - Build MCP servers with Node/TypeScript SDK — tools, resources, prompts, Zod validation, stdio vs Streamable HTTP. Use Context7 or official MCP docs for latest API.

- **mobile-money-payment-flow** — `C:\Users\ahouf\.claude\skills\mobile-money-payment-flow`
  - Utilise ce skill dès que tu codes l'initiation d'un paiement, la réception d'un webhook de l'agrégateur (Campay, Notch Pay, Monetbil), ou la réconciliation d'une transaction ambiguë. Applique-le aussi pour tout ce qui to

- **next-best-practices** — `C:\Users\ahouf\.claude\skills\next-best-practices`
  - Next.js App Router best practices covering file conventions, RSC boundaries, async APIs, data patterns, hydration errors, metadata, route handlers, image/font optimization, and bundling. Use when writing or reviewing Nex

- **nextjs-app-router-patterns** — `C:\Users\ahouf\.claude\skills\nextjs-app-router-patterns`
  - Comprehensive patterns for Next.js 14+ App Router architecture, Server Components, and modern full-stack React development.

- **nextjs-shadcn** — `C:\Users\ahouf\.claude\skills\nextjs-shadcn`
  - Creates Next.js frontends with shadcn/ui. Use when building React UIs, components, pages, or applications with shadcn, Tailwind, or modern frontend patterns. Also use when the user asks to create a new Next.js project, a

- **nextjs-supabase-auth** — `C:\Users\ahouf\.claude\skills\nextjs-supabase-auth`
  - Expert integration of Supabase Auth with Next.js App Router

- **nextjs-turbopack** — `C:\Users\ahouf\.claude\skills\nextjs-turbopack`
  - Next.js 16+ and Turbopack — incremental bundling, FS caching, dev speed, and when to use Turbopack vs webpack.

- **notification-system** — `C:\Users\ahouf\.claude\skills\notification-system`
  - Utilise ce skill dès que tu codes l'envoi d'une notification (push, email, SMS, in-app), la gestion des templates de notification, ou tout déclencheur automatique lié à un événement (expiration d'abonnement, contenu publ

- **nutrient-document-processing** — `C:\Users\ahouf\.claude\skills\nutrient-document-processing`
  - Process, convert, OCR, extract, redact, sign, and fill documents using the Nutrient DWS API. Works with PDFs, DOCX, XLSX, PPTX, HTML, and images.

- **postgres-patterns** — `C:\Users\ahouf\.claude\skills\postgres-patterns`
  - PostgreSQL database patterns for query optimization, schema design, indexing, and security. Based on Supabase best practices.

- **prompt-optimizer** — `C:\Users\ahouf\.claude\skills\prompt-optimizer`
  - >-

- **react-best-practices** — `C:\Users\ahouf\.claude\skills\react-best-practices`
  - React and Next.js performance optimization guide from Vercel Engineering (70 rules in 8 categories). Use when writing, reviewing, or refactoring React/Next.js code to eliminate waterfalls, reduce bundle size, prevent re-

- **repo-scan** — `C:\Users\ahouf\.claude\skills\repo-scan`
  - Cross-stack source code asset audit — classifies every file, detects embedded third-party libraries, and delivers actionable four-level verdicts per module with interactive HTML reports.

- **rls-policies-admin-eleve** — `C:\Users\ahouf\.claude\skills\rls-policies-admin-eleve`
  - Applique ce skill à chaque fois que tu crées une table, une fonction Supabase, ou une route API dans ce projet. La sécurité repose entièrement sur Row Level Security au niveau base de données, pas sur des vérifications c

- **security-review** — `C:\Users\ahouf\.claude\skills\security-review`
  - Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, or implementing payment/sensitive features. Provides comprehensive security checklist and patterns.

- **security-scan** — `C:\Users\ahouf\.claude\skills\security-scan`
  - Scan your Claude Code configuration (.claude/ directory) for security vulnerabilities, misconfigurations, and injection risks using AgentShield. Checks CLAUDE.md, settings.json, MCP servers, hooks, and agent definitions.

- **shadcn** — `C:\Users\ahouf\.claude\skills\shadcn`
  - Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI. Provides project context, component docs, and usage examples. Applies when working with shadcn/ui, component regis

- **subscription-access-control** — `C:\Users\ahouf\.claude\skills\subscription-access-control`
  - Utilise ce skill dès que tu codes une vérification d'accès à une fonctionnalité ou un contenu selon le palier d'abonnement (gratuit/journalier/hebdomadaire/mensuel/annuel). Applique-le pour tout écran ou route API qui dé

- **supabase-postgres-best-practices** — `C:\Users\ahouf\.claude\skills\supabase-postgres-best-practices`
  - Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations.

- **tdd-workflow** — `C:\Users\ahouf\.claude\skills\tdd-workflow`
  - Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage including unit, integration, and E2E tests.

- **terminal-ops** — `C:\Users\ahouf\.claude\skills\terminal-ops`
  - Evidence-first repo execution workflow for ECC. Use when the user wants a command run, a repo checked, a CI failure debugged, or a narrow fix pushed with exact proof of what was executed and verified.

- **vercel-optimize** — `C:\Users\ahouf\.claude\skills\vercel-optimize`
  - Audit deployed Vercel apps for cost and performance issues using metrics, project config, code scans, and version-aware recommendations.

- **verification-loop** — `C:\Users\ahouf\.claude\skills\verification-loop`
  - A comprehensive verification system for Claude Code sessions.

- **web-design-guidelines** — `C:\Users\ahouf\.claude\skills\web-design-guidelines`
  - Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".

---

## Suggested next steps

- **MCP:** Use this extension’s hub **MCP** tab, or `claude mcp list` in the terminal. In Claude Code, use `/mcp` to connect servers for the session.
- **Edit config:** Open `~/.claude.json` (user MCP) or `<workspace>/.mcp.json` (project MCP) via the extension commands.
- **Refresh this report:** run **Intelligence — scan MCP & Skills awareness** again after changing MCP config or adding skills.

_Report from Cloude Code ToolBox extension._
