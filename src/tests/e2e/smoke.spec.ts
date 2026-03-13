import { expect, test } from '@playwright/test';

test('health endpoint is reachable', async ({ request }) => {
  const response = await request.get('/api/health');

  expect(response.ok()).toBeTruthy();
});

test('dashboard is protected for signed-out users', async ({ page }) => {
  const response = await page.goto('/dashboard');

  expect(response?.status()).toBeGreaterThanOrEqual(300);
  expect(page.url()).toContain('/sign-in');
});

test('share routes stay public', async ({ page }) => {
  const response = await page.goto('/share/demo-token');

  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Shared presentation' })).toBeVisible();
});
