import { test, expect } from '@playwright/test';
import { navigateTo } from './helpers';

test.describe('navigation', () => {
  test('homepage has hero section and feed', async ({ page }) => {
    await navigateTo(page, '/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[aria-label="Today\'s stats masthead"]')).toBeVisible();
    await expect(page.locator('text=Your Verified Feed')).toBeVisible();
  });

  test('category page shows correct heading', async ({ page }) => {
    await navigateTo(page, '/category/technology/');
    await expect(page.locator('h1')).toContainText('Tech');
  });

  test('category page shows category breadcrumb', async ({ page }) => {
    await navigateTo(page, '/category/science/');
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
  });

  test('category page renders feed grid', async ({ page }) => {
    await navigateTo(page, '/category/politics/');
    await expect(page.locator('[role="article"][aria-label^="Read article"]').first()).toBeAttached({ timeout: 10000 });
  });

  test('search page accepts query and shows results', async ({ page }) => {
    await navigateTo(page, '/search?q=india');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('how-it-works page renders pipeline steps', async ({ page }) => {
    await navigateTo(page, '/how-it-works/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('saved bookmarks page renders', async ({ page }) => {
    await navigateTo(page, '/saved/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('legal pages are accessible', async ({ page }) => {
    await navigateTo(page, '/privacy/');
    await expect(page.locator('h1')).toBeVisible();
    await navigateTo(page, '/terms/');
    await expect(page.locator('h1')).toBeVisible();
    await navigateTo(page, '/corrections/');
    await expect(page.locator('h1')).toBeVisible();
    await navigateTo(page, '/contact/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('404 page for unknown routes', async ({ page }) => {
    const resp = await page.goto('/this-does-not-exist', { waitUntil: 'domcontentloaded' });
    expect(resp?.status()).toBe(404);
  });
});
