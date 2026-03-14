---
name: review-pr
description: Review a pull request or the current branch's changes against main with present.fast project-specific knowledge.
also_command: true
disable-model-invocation: true
---

# Review PR / Branch Changes

Review code changes for correctness, patterns compliance, and cross-boundary consistency.

## Step 1: Gather the diff

Determine what to review from $ARGUMENTS:

- PR number → `gh pr diff <number>`
- Branch name → `git diff main...<branch>`
- File paths → `git diff` on those files
- Nothing → `git diff main...HEAD`

Also run:
- `git log main..HEAD --oneline` — understand the commit history
- `git diff main...HEAD --stat` — overview of changed files

## Step 2: Evaluate

Read every changed file in the diff. For each file, check against the relevant conventions:

### Convex backend (`convex/`)

| Check | What to verify |
|---|---|
| Auth pattern | Mutations call `ensureUserAndDefaultWorkspace()` or equivalent before any operation |
| Permission check | `assertWorkspaceMembership()` is called after getting user context |
| Validators | All mutation `args` use `v.` validators |
| Timestamps | `createdAt` and `updatedAt` set on inserts, `updatedAt` on patches |
| Query safety | Queries return `null` for not-found (not throw) |
| Index usage | Queries use `.withIndex()` for indexed fields |
| Error types | Custom errors extend `Error` with descriptive messages |
| No generated files | `convex/_generated/` must never be committed |

### React components (`src/`)

| Check | What to verify |
|---|---|
| Server/client split | `'use client'` only where needed (hooks, interactivity, browser APIs) |
| Import style | Type imports use `import type`, `@/` alias used, import order correct |
| Component typing | Props use `type` (not `interface`), inline in same file |
| Loading states | `useQuery()` undefined case handled |
| Error handling | Mutations wrapped in try/catch with user-facing error display |
| Styling | Uses `cn()`, Tailwind classes, theme tokens — no hardcoded colors |
| Accessibility | Interactive elements keyboard-accessible, proper ARIA attributes |
| File naming | Kebab-case, one component per file |

### Pages and routes (`src/app/`)

| Check | What to verify |
|---|---|
| Auth protection | Protected pages check `await auth()` and redirect |
| Metadata | Pages export `metadata` with title and description |
| Params typing | Dynamic route params typed as `Promise<{ param: string }>` and awaited |
| Thin pages | Pages delegate to feature/component modules, don't contain business logic |

### Theme and styling (`src/styles/`)

| Check | What to verify |
|---|---|
| Token usage | New colors defined in `tokens.css`, not hardcoded in components |
| Dark mode | Both light and dark variants defined for new tokens |
| HSL format | Colors use `hsl(H S% L%)` format |

### Tests (`src/tests/`)

| Check | What to verify |
|---|---|
| Test location | Unit in `unit/`, integration in `integration/`, E2E in `e2e/` |
| Import source | Vitest imports from `vitest`, Playwright from `@playwright/test` |
| Independence | Tests don't share mutable state |
| Naming | `.test.ts` for Vitest, `.spec.ts` for Playwright |

### Cross-boundary consistency

| Check | What to verify |
|---|---|
| Schema ↔ mutations | New schema fields used correctly in mutations and queries |
| Backend ↔ frontend | Convex function API matches how components call it |
| Types alignment | TypeScript types match Convex schema validators |
| Route ↔ config | New routes added to `src/config/routes.ts` if reused elsewhere |

## Step 3: Report

### Format

```
## PR Review: <branch or PR title>

### Summary
<1-2 sentence overview of what the changes do>

### Findings

#### 🔴 Blockers (must fix before merge)
- **[file:line]** Description of issue
  Suggested fix: ...

#### 🟡 Warnings (should fix)
- **[file:line]** Description of concern
  Suggested fix: ...

#### 🟢 Suggestions (nice to have)
- **[file:line]** Description of improvement

#### ✅ What looks good
- Brief callout of well-implemented patterns

### Verdict
- **Ready to merge** / **Needs changes** / **Needs discussion**
```

### Severity guide

- **🔴 Blocker**: Security issue, broken functionality, missing auth check, data loss risk, type error, committed secrets or generated files
- **🟡 Warning**: Missing error handling, inconsistent patterns, missing accessibility, suboptimal queries, missing tests for new features
- **🟢 Suggestion**: Code style improvements, refactoring opportunities, documentation gaps

## Rules

- Read the full file for context, not just the diff lines
- Check cross-boundary consistency for every Convex schema or API change
- Never approve changes that include `.env` files, `convex/_generated/`, or `node_modules/`
- Flag any `as any` type assertions — they should be temporary and documented
