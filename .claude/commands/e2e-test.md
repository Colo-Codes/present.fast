Scaffold a new Playwright E2E test for "$ARGUMENTS".

## Step 1: Parse the request

Extract from $ARGUMENTS:

- **What to test**: the feature, flow, or page being tested
- **Test type**: API endpoint test, page navigation, auth flow, user interaction, or full user journey
- **Auth needs**: whether the test requires authentication or tests unauthenticated behavior

If the description is ambiguous, ask the user to clarify before proceeding.

## Step 2: Study existing patterns

Read these files to match project conventions:

| Pattern                                         | Reference file                             |
| ----------------------------------------------- | ------------------------------------------ |
| API test, auth redirect test, public route test | `src/tests/e2e/smoke.spec.ts`              |
| Playwright config                               | `playwright.config.ts`                     |
| Playwright skill                                | `.claude/skills/playwright-tests/SKILL.md` |

Key conventions:

- Tests live in `src/tests/e2e/<name>.spec.ts`
- File names use kebab-case with `.spec.ts` suffix
- Use `test()` from `@playwright/test` (not `describe()` unless sharing `beforeEach`)
- Use `{ request }` fixture for API-only tests (no browser overhead)
- Use `{ page }` fixture for navigation/UI tests
- Prefer accessible selectors over CSS selectors:
  - `page.getByRole('button', { name: 'Submit' })` over `page.locator('.submit-btn')`
  - `page.getByRole('heading', { name: 'Title' })` over `page.locator('h1')`
  - `page.getByLabel('Email')` over `page.locator('#email')`
  - `page.getByText('Welcome')` over `page.locator('.welcome')`
  - `page.getByTestId('id')` only as last resort
- Prefer `await expect(...).toBeVisible()` over checking existence
- Test auth redirects by checking status code `>= 300`
- Keep tests independent — no shared state between tests
- Base URL is `http://localhost:3000` (configured in `playwright.config.ts`)

## Step 3: Show the plan

Before writing any files, present:

```
File: src/tests/e2e/<name>.spec.ts
Tests:
  1. <test description> — fixture: [request | page]
  2. <test description> — fixture: [request | page]
  ...

Auth: [unauthenticated | Clerk test user]
```

Wait for the user to confirm before proceeding.

## Step 4: Create the test file

**API endpoint test:**

```ts
import { expect, test } from '@playwright/test';

test('<endpoint> returns expected response', async ({ request }) => {
  const response = await request.get('/api/<path>');
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.<field>).toBe(<expected>);
});
```

**Page navigation test:**

```ts
import { expect, test } from '@playwright/test';

test('<page> renders correctly', async ({ page }) => {
  await page.goto('/<path>');
  await expect(page.getByRole('heading', { name: '<expected heading>' })).toBeVisible();
});
```

**Auth redirect test:**

```ts
import { expect, test } from '@playwright/test';

test('<page> redirects unauthenticated users to sign-in', async ({ page }) => {
  const response = await page.goto('/<protected-path>');
  expect(response?.status()).toBeGreaterThanOrEqual(300);
  expect(page.url()).toContain('/sign-in');
});
```

**User interaction test:**

```ts
import { expect, test } from '@playwright/test';

test('user can <action>', async ({ page }) => {
  await page.goto('/<path>');

  await page.getByRole('button', { name: '<button text>' }).click();
  await expect(page.getByText('<expected result>')).toBeVisible();
});
```

Group related tests with `test.describe()` only if they share setup via `test.beforeEach()`.

## Step 5: Verify

Run the test:

```bash
npx playwright test src/tests/e2e/<name>.spec.ts
```

If the test fails, diagnose the issue. Use `npx playwright test --ui` for interactive debugging if needed.

Report results concisely.
