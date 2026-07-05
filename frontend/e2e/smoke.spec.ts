import { test, expect } from '@playwright/test';

const CORE_ROUTES = ['/', '/category/politics/', '/category/business/', '/saved/', '/search?q=india', '/how-it-works/'];

test.describe('smoke', () => {
  for (const route of CORE_ROUTES) {
    test(`${route} loads with no fatal errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      page.on('response', (resp) => {
        if (resp.status() === 404 && !/hot-update|favicon|webmanifest/.test(resp.url())) {
          errors.push(`404 ${resp.url()}`);
        }
      });

      const resp = await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 });
      expect(resp?.status()).toBeLessThan(400);
      await page.waitForTimeout(500);

      expect(errors).toEqual([]);
    });
  }

  test('no hydration or runtime errors across all core routes', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    for (const route of CORE_ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(300);
    }

    expect(errors).toEqual([]);
  });
});
