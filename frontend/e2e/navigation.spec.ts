import { test, expect } from '@playwright/test';
import { navigateTo } from './helpers';

test.describe('navigation', () => {
  test('homepage has hero section and feed', async ({ page }) => {
    await navigateTo(page, '/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.locator('[aria-label="Today\'s edition"]')).toBeVisible();
    await expect(page.locator('text=Your Verified Feed')).toBeVisible();
  });

  test('category page shows correct heading', async ({ page }) => {
    await navigateTo(page, '/category/tech/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('Tech');
  });

  test('category page shows category breadcrumb', async ({ page }) => {
    await navigateTo(page, '/category/science/');
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).first()).toBeVisible();
  });

  test('category page renders feed grid', async ({ page }) => {
    await navigateTo(page, '/category/politics/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[role="article"][aria-label^="Read article"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('search page accepts query and shows results', async ({ page }) => {
    await navigateTo(page, '/search?q=india');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('how-it-works page renders pipeline steps', async ({ page }) => {
    await navigateTo(page, '/how-it-works/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('saved bookmarks page renders', async ({ page }) => {
    await navigateTo(page, '/saved/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('legal pages are accessible', async ({ page }) => {
    await navigateTo(page, '/privacy/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await navigateTo(page, '/terms/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await navigateTo(page, '/corrections/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await navigateTo(page, '/contact/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('404 page for unknown routes', async ({ page }) => {
    const resp = await page.goto('/this-does-not-exist', { waitUntil: 'domcontentloaded' });
    expect(resp?.status()).toBe(404);
  });
});
