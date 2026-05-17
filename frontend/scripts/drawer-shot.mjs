// last edited 2026-05-17 by roshhellwett
// Opens the homepage and clicks the first news card to trigger the
// NewsDrawer, then captures it on desktop so we can verify the
// end-of-story anchoring fix.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const OUT = 'scripts/editorial-shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
// Click the first feed card (NewsCard) — they live under section[aria-label*="Latest"] or .feed-grid
const card = page.locator('.feed-grid a, .feed-grid button').first();
await card.click({ trial: false }).catch(() => null);
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/desktop_drawer_open.png`, fullPage: false });
await browser.close();
console.log('done');
