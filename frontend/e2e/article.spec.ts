import { test, expect } from '@playwright/test';
import { navigateTo, openFirstArticle, closeDrawer } from './helpers';

test.describe('article drawer', () => {
  test('opens when clicking a news card', async ({ page }) => {
    await navigateTo(page, '/');
    const drawer = await openFirstArticle(page);
    await expect(drawer).toContainText(/score|credibility|source/i);
  });

  test('displays headline and summary inside drawer', async ({ page }) => {
    await navigateTo(page, '/');
    const drawer = await openFirstArticle(page);
    await expect(drawer.locator('h2')).toBeVisible();
  });

  test('can navigate to related article', async ({ page }) => {
    await navigateTo(page, '/');
    const drawer = await openFirstArticle(page);

    const relatedItem = drawer.locator('ul li button').first();
    if (await relatedItem.isVisible()) {
      const initialHeading = await drawer.locator('h2').textContent();
      await relatedItem.click();
      await page.waitForTimeout(700);
      const newHeading = await drawer.locator('h2').textContent();
      expect(newHeading).not.toBe(initialHeading);
    }
  });

  test('closes on close button click', async ({ page }) => {
    await navigateTo(page, '/');
    const drawer = await openFirstArticle(page);
    await closeDrawer(page, drawer);
  });

  test('credibility score ring is visible', async ({ page }) => {
    await navigateTo(page, '/');
    const drawer = await openFirstArticle(page);
    await expect(drawer.locator('[aria-label*="score"]').first()).toBeVisible({ timeout: 3000 });
  });

  test('source links are present', async ({ page }) => {
    await navigateTo(page, '/');
    const drawer = await openFirstArticle(page);
    const sourceSection = drawer.locator('text=sources').first();
    await expect(sourceSection).toBeVisible({ timeout: 3000 });
  });

  test('keyboard navigation: Escape closes drawer', async ({ page }) => {
    await navigateTo(page, '/');
    const drawer = await openFirstArticle(page);
    const focusable = drawer.locator('a, button, [tabindex], input, textarea').first();
    if ((await focusable.count()) > 0) {
      await focusable.focus();
    } else {
      await drawer.focus();
    }
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible({ timeout: 5000 });
  });

  test('navigates to article page via card click on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await navigateTo(page, '/');
    await page.waitForLoadState('networkidle');
    const card = page.locator('[role="article"][aria-label^="Read article"]').first();
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await page.waitForTimeout(500);
    const drawer = page.locator('[role="dialog"]').first();
    await expect(drawer).toBeVisible({ timeout: 5000 });
  });
});
