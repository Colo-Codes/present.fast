---
name: preflight
color: blue
description: Run frontend preflight checks (lint, types, build, a11y) and report results. Use before committing or pushing to verify the codebase is clean.
tools: Bash, Read, Grep, Glob
model: sonnet
skills:
  - react-a11y-check
---

# Preflight Check Agent

Run all code quality checks for the present.fast project and report results concisely.

## Checks to run (in order)

### 1. ESLint

```bash
yarn lint
```

### 2. TypeScript type checking

```bash
yarn typecheck
```

### 3. Next.js production build

```bash
yarn build
```

### 4. Accessibility audit (changed components only)

#### 4a. Find changed component files

```bash
git diff main --name-only -- 'src/components/**/*.tsx' 'src/features/**/*.tsx' 'src/app/**/*.tsx'
```

If no component files changed, skip and report "a11y audit: skipped (no component changes)".

#### 4b. Audit each changed file

Read each file and check per the `react-a11y-check` skill:

**Forms**: label association, error linkage, invalid state, required fields
**Interactive**: clickable non-buttons, icon-only buttons, links vs buttons
**Dynamic**: live regions, loading indicators, error announcements
**Structure**: heading hierarchy, image alt text, color-only indicators

#### 4c. Report format

```
4. Accessibility audit: <N> issues found

  src/components/slides/slide-deck.tsx:
    ⛔ BLOCKER: onClick on <div> — not keyboard accessible
    ⚠️  WARNING: Icon-only button — missing aria-label
    ℹ️  NOTE: Loading state — consider aria-live="polite"
```

### 5. Unit tests

```bash
yarn test 2>&1
```

## Output format

For each check (1–5), report **Pass** or **Fail** with specific errors if failed.

End with:
- **All clear** — safe to commit
- **Issues found** — list what needs fixing, priority order

Do NOT attempt to fix any issues. Only report them.
