---
name: react-add-tests
description: Add tests to the present.fast project. Use to bootstrap testing infrastructure or write tests for specific components and utilities.
also_command: true
disable-model-invocation: true
---

# Add Tests — present.fast

Write tests for components, hooks, utilities, or API routes in this project.

## Test infrastructure

This project already has testing set up:

- **Vitest** — unit and integration tests
- **Playwright** — E2E tests
- Config: `vitest.config.ts`, `playwright.config.ts`
- Path alias: `@/` → `src/`

## Test file locations

```
src/tests/
├── unit/           # Pure function tests, utility tests
├── integration/    # API route tests, multi-module tests
└── e2e/            # Playwright browser tests (*.spec.ts)
```

## Step 1: Determine test type

Parse $ARGUMENTS to decide what to test:

| Input | Action |
|---|---|
| `setup` | Verify infrastructure is working — skip if already set up |
| A utility name (e.g. `toTitleCase`) | Write unit test in `src/tests/unit/` |
| A component name (e.g. `AuthHeader`) | Write unit test in `src/tests/unit/` |
| A route (e.g. `/api/health`) | Write integration test in `src/tests/integration/` |
| An E2E flow (e.g. `auth flow`) | Write E2E test in `src/tests/e2e/` |

## Step 2: Find the source

1. Locate the source file for the target
2. Read it fully to understand:
   - What it exports
   - What dependencies it has
   - What side effects it produces
   - What edge cases exist

## Step 3: Write the test

### Unit test pattern (Vitest)

```ts
import { describe, expect, it } from 'vitest';
import { myFunction } from '@/utils/my-module';

describe('myFunction', () => {
  it('handles the happy path', () => {
    expect(myFunction('input')).toBe('expected');
  });

  it('handles edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(undefined)).toBeUndefined();
  });
});
```

### Integration test pattern (API routes)

```ts
import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns ok payload', async () => {
    const response = GET();
    const payload = await response.json();

    expect(payload.ok).toBe(true);
  });
});
```

### E2E test pattern (Playwright)

```ts
import { expect, test } from '@playwright/test';

test('page renders correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

## Naming conventions

- Unit/integration: `<name>.test.ts` or `<name>.test.tsx`
- E2E: `<name>.spec.ts`
- Name files after the module being tested: `strings.test.ts`, `health-route.test.ts`

## Running tests

```bash
yarn test          # Run Vitest (unit + integration)
yarn test:watch    # Vitest in watch mode
yarn test:e2e      # Run Playwright E2E tests
```

## Rules

- Import `describe`, `expect`, `it` from `vitest` (not globals)
- Import `test`, `expect` from `@playwright/test` for E2E
- Use `@/` path aliases in tests
- Test behavior, not implementation details
- Keep tests independent — no shared mutable state
- Mock external services (Convex, Clerk) only when necessary
- Prefer testing pure functions directly over testing through components
