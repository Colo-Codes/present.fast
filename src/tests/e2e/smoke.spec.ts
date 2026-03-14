import { expect, test } from '@playwright/test';

test('health endpoint is reachable', async ({ request }) => {
  const response = await request.get('/api/health');

  expect(response.ok()).toBeTruthy();
});

test('dashboard is protected for signed-out users', async ({ page }) => {
  const response = await page.goto('/dashboard');

  const status = response?.status() ?? 0;
  expect(status === 200 || status >= 300).toBeTruthy();
  await expect(page).toHaveURL(/sign-in/);
});

test('signed-out users see login prompt on deck route', async ({ page }) => {
  const response = await page.goto('/presentation/j57d3g0r6phdp2jvga62a74n4h7m7mjy');

  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Login required' })).toBeVisible();
});

test('signed-out users see login prompt on deck display mode route', async ({ page }) => {
  const response = await page.goto('/presentation/j57d3g0r6phdp2jvga62a74n4h7m7mjy?mode=display');

  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Login required' })).toBeVisible();
});

test('invalid share tokens return not found', async ({ page }) => {
  const response = await page.goto('/share/demo-token');

  expect(response?.status()).toBe(404);
});

test('signed-in unauthorized users see explicit unauthorized message', async ({ page }) => {
  const response = await page.goto(
    '/presentation/j57d3g0r6phdp2jvga62a74n4h7m7mz?e2e=forbidden&mode=display',
  );

  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Not authorized' })).toBeVisible();
  await expect(page.getByText('You are not authorized to access this deck.')).toBeVisible();
});

test('valid share token renders snapshot view', async ({ page }) => {
  const response = await page.goto('/share/e2e-valid-share-token?e2e=snapshot');

  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'E2E Shared Deck' })).toBeVisible();
  await expect(page.getByText('This is a shared snapshot view.')).toBeVisible();
});
