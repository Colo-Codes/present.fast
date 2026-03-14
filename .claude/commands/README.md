# Claude Code Commands

Slash commands for scaffolding and quality checks in the present.fast project.

## Scaffolding

- `/convex-mutation <description>` — Scaffold a new Convex mutation with auth, permissions, and timestamps
- `/convex-query <description>` — Scaffold a new Convex query with auth, indexes, and access control
- `/feature-module <name>` — Scaffold a full feature module (frontend + Convex backend)
- `/new-page <route>` — Scaffold a new Next.js App Router page with metadata and auth
- `/api-route <path>` — Scaffold a new Next.js API route handler
- `/shadcn-component <name>` — Add and customize a shadcn/ui component
- `/e2e-test <description>` — Scaffold a Playwright E2E test

## Quality

- `/preflight` — Run lint, typecheck, and build checks (or `yarn check:all`)
