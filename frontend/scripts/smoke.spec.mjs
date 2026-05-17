// last edited 2026-05-17 by roshhellwett
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = 'scripts/screenshots';
mkdirSync(OUT, { recursive: true });

const ROUTES = ['/', '/category/politics/', '/category/business/', '/saved/', '/search?q=india', '/how-it-works/'];

const FATAL_PATTERNS = [
  /Hydration failed/i,
  /Text content does not match/i,
  /Each child in a list/i,
  /Warning: Encountered two children with the same key/i,
  /Cannot read propert/i,
  /is not a function/i,
  /Failed to fetch/i,
];

const IGNORE_PATTERNS = [
  /Download the React DevTools/i,
  /Fast Refresh/i,
  /\[Fast Refresh\]/i,
  /favicon/i,
  /webmanifest/i,
  /Failed to load resource.*status of 404/i,
];

const findings = [];

async function runOn(label, contextOpts) {
  const browser = await chromium.launch();
  const context = await browser.newContext(contextOpts);
  const page = await context.newPage();
  const consoleMsgs = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on('response', (resp) => {
    if (resp.status() === 404) {
      const u = resp.url();
      if (/hot-update|gstatic\.com\/faviconV2|google\.com\/s2\/favicons/i.test(u)) return;
      findings.push(`[${label}] 404 ${u}`);
    }
  });
  page.on('console', (m) => {
    const type = m.type();
    const text = m.text();
    if (IGNORE_PATTERNS.some((r) => r.test(text))) return;
    if (type === 'error' || type === 'warning') consoleMsgs.push(`[${label}] [${type}] ${text}`);
  });
  page.on('pageerror', (err) => pageErrors.push(`[${label}] PAGEERROR ${err.message}`));
  page.on('requestfailed', (req) => {
    const u = req.url();
    if (/_next\/static|_next\/data|favicon|webmanifest|hot-update/i.test(u)) return;
    const err = req.failure()?.errorText ?? '';
    if (/ERR_ABORTED|ABORTED/i.test(err)) return;
    requestFailures.push(`[${label}] REQFAIL ${req.method()} ${u} :: ${err}`);
  });

  for (const route of ROUTES) {
    const url = BASE + route;
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
      if (!resp || resp.status() >= 400) {
        findings.push(`[${label}] HTTP ${resp?.status()} on ${route}`);
      }
      await page.waitForTimeout(400);
      const safeName = route.replace(/[^a-z0-9]/gi, '_') || 'root';
      await page.screenshot({ path: `${OUT}/${label}_${safeName}.png`, fullPage: false });
    } catch (e) {
      findings.push(`[${label}] NAV-FAIL ${route} :: ${e.message}`);
    }
  }

  // Open the first news card on homepage and assert drawer.
  try {
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const card = page.locator('[role="button"][aria-label^="Read article"]').first();
    if (await card.count()) {
      await card.click();
      const drawer = page.locator('[role="dialog"][aria-label^="Article"]');
      await drawer.waitFor({ state: 'visible', timeout: 5000 });
      await page.screenshot({ path: `${OUT}/${label}_drawer_open.png`, fullPage: false });
      // Wait for related list to hydrate (skeleton -> list)
      const relatedItem = drawer.locator('ul li button').first();
      await relatedItem.waitFor({ state: 'visible', timeout: 6000 }).catch(() => {});
      if (await relatedItem.count()) {
        await relatedItem.click().catch(() => {});
        await page.waitForTimeout(700);
        await page.screenshot({ path: `${OUT}/${label}_drawer_swapped.png`, fullPage: false });
      } else {
        findings.push(`[${label}] No related items inside drawer`);
      }
      // Close drawer
      const closeBtn = drawer.locator('button[aria-label="Close article"]');
      await closeBtn.click().catch(() => {});
    } else {
      findings.push(`[${label}] No news card found on /`);
    }
  } catch (e) {
    findings.push(`[${label}] DRAWER-FAIL :: ${e.message}`);
  }

  // Classify console messages
  for (const m of consoleMsgs) {
    if (FATAL_PATTERNS.some((r) => r.test(m))) findings.push('FATAL ' + m);
    else findings.push('warn  ' + m);
  }
  for (const e of pageErrors) findings.push('FATAL ' + e);
  for (const r of requestFailures) findings.push(r);

  await browser.close();
}

await runOn('desktop', { viewport: { width: 1366, height: 900 } });
await runOn('mobile', { ...devices['iPhone 13'] });

if (findings.length === 0) {
  console.log('SMOKE PASS — zero findings');
} else {
  console.log(`SMOKE FINDINGS (${findings.length}):`);
  for (const f of findings) console.log(' • ' + f);
  process.exitCode = 1;
}
