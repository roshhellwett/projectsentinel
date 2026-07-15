import { expect, Locator, Page } from '@playwright/test';

/** Navigate to a route and assert the page loaded successfully. */
export async function navigateTo(page: Page, route: string) {
  const resp = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30000 });
  expect(resp?.status(), `GET ${route} should succeed`).toBeLessThan(400);
}

/** Dismiss the cookie dialog when it appears so tests can target app dialogs precisely. */
export async function dismissCookieDialog(page: Page) {
  const cookieDialog = page.getByRole('dialog', { name: 'Cookie preferences' });
  if (await cookieDialog.isVisible().catch(() => false)) {
    await cookieDialog.getByRole('button', { name: /dismiss|accept/i }).first().click();
    await expect(cookieDialog).not.toBeVisible({ timeout: 3000 });
  }
}

/** Open the first article card on the page and return the drawer locator. */
export async function openFirstArticle(page: Page) {
  await dismissCookieDialog(page);
  await page.waitForLoadState('networkidle');
  const card = page.locator('[role="article"][aria-label^="Read article"]').first();
  await expect(card).toBeVisible({ timeout: 10000 });
  await card.click();
  const drawer = page.getByRole('dialog', { name: /^Article:/ }).first();
  await expect(drawer).toBeVisible({ timeout: 5000 });
  return drawer;
}

/** Close the article drawer. */
export async function closeDrawer(page: Page, drawer: Locator) {
  const closeBtn = page.getByRole('button', { name: 'Close article' });
  await expect
    .poll(async () => {
      return closeBtn.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return top === el || el.contains(top);
      });
    }, { timeout: 5000 })
    .toBe(true);
  await closeBtn.click({ force: true });
  await expect(drawer).not.toBeVisible({ timeout: 3000 });
}
