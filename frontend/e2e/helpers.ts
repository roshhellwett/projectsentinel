import { expect, Locator, Page } from '@playwright/test';

/** Navigate to a route and assert the page loaded successfully. */
export async function navigateTo(page: Page, route: string) {
  const resp = await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 });
  expect(resp?.status(), `GET ${route} should succeed`).toBeLessThan(400);
}

/** Open the first article card on the page and return the drawer locator. */
export async function openFirstArticle(page: Page) {
  const card = page.locator('[role="button"][aria-label^="Read article"]').first();
  await expect(card).toBeVisible({ timeout: 10000 });
  await card.click();
  const drawer = page.locator('[role="dialog"]').first();
  await expect(drawer).toBeVisible({ timeout: 5000 });
  return drawer;
}

/** Close the article drawer. */
export async function closeDrawer(page: Page, drawer: Locator) {
  const closeBtn = drawer.locator('button[aria-label="Close article"]');
  await closeBtn.click();
  await expect(drawer).not.toBeVisible({ timeout: 3000 });
}
