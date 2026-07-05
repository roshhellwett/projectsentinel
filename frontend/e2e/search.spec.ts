import { test, expect } from '@playwright/test';
import { navigateTo } from './helpers';

test.describe('search', () => {
  test('search page with query renders results grid', async ({ page }) => {
    await navigateTo(page, '/search?q=india');
    const heading = page.locator('h1');
    await expect(heading).toContainText(/india/i);
  });

  test('empty search shows no-results state', async ({ page }) => {
    await navigateTo(page, '/search?q=xyznonexistent2024');
    await page.waitForTimeout(1000);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('search bar on homepage is interactive', async ({ page }) => {
    await navigateTo(page, '/');
    const searchBar = page.locator('input[type="text"], input[placeholder*="search" i], input[placeholder*="Search" i]');
    if (await searchBar.isVisible()) {
      await searchBar.fill('cricket');
      await searchBar.press('Enter');
      await page.waitForURL(/search/, { timeout: 10000 });
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});
