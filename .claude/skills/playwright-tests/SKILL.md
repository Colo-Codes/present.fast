---
name: playwright-tests
description: Playwright E2E testing patterns for the present.fast project. Use when writing, modifying, or debugging end-to-end tests.
---

# Playwright E2E Testing Conventions — present.fast

## Configuration

```ts
// playwright.config.ts
{
  testDir: './src/tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'yarn dev',
    port: 3000,
    reuseExistingServer: true,
  },
}
```

- Tests live in `src/tests/e2e/*.spec.ts`
- Dev server auto-starts if not already running
- Base URL: `http://localhost:3000`

## Test patterns

### API endpoint test

```ts
import { expect, test } from '@playwright/test';

test('health endpoint returns ok', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.ok).toBe(true);
});
```

### Page navigation test

```ts
test('landing page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

### Auth redirect test

```ts
test('dashboard redirects unauthenticated users to sign-in', async ({ page }) => {
  const response = await page.goto('/dashboard');
  expect(response?.status()).toBeGreaterThanOrEqual(300);
  expect(page.url()).toContain('/sign-in');
});
```

### Public route test

```ts
test('share routes stay public', async ({ page }) => {
  const response = await page.goto('/share/demo-token');
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Shared presentation' })).toBeVisible();
});
```

## Selectors

Prefer accessible selectors over CSS/test IDs:

| Prefer | Over |
|---|---|
| `page.getByRole('button', { name: 'Submit' })` | `page.locator('.submit-btn')` |
| `page.getByRole('heading', { name: 'Title' })` | `page.locator('h1')` |
| `page.getByLabel('Email')` | `page.locator('#email')` |
| `page.getByText('Welcome')` | `page.locator('.welcome')` |
| `page.getByTestId('feature-card')` | (only as last resort) |

## Running tests

```bash
yarn test:e2e              # Run all E2E tests
npx playwright test <file> # Run specific file
npx playwright test --ui   # Interactive UI mode
npx playwright show-report # View HTML report after run
```

## Conventions

- Use `test()` (not `describe()`) — Playwright groups by file
- Use `{ request }` fixture for API-only tests (no browser needed)
- Use `{ page }` fixture for navigation/UI tests
- Prefer `await expect(...).toBeVisible()` over checking existence
- Test auth redirects by checking status code `>= 300`
- Keep tests independent — no shared state between tests
- Use `test.describe()` only when tests share setup via `test.beforeEach()`

## Auth in E2E tests

For tests requiring authentication, set up a Clerk test user or use Clerk's testing tokens. Unauthenticated tests should verify redirect behavior.

## File naming

- Use `.spec.ts` suffix: `smoke.spec.ts`, `auth-flow.spec.ts`
- Name files by feature or flow being tested
