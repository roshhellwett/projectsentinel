// last edited 2026-05-17 by roshhellwett
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const OUT = 'scripts/mobile-shots';
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/category/politics/', name: 'category' },
  { path: '/saved/', name: 'saved' },
  { path: '/how-it-works/', name: 'how' },
  { path: '/search?q=india', name: 'search' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const page = await ctx.newPage();

for (const r of ROUTES) {
  console.log('→', r.path);
  await page.goto(BASE + r.path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  // Section-by-section scroll captures
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  let y = 0;
  let i = 0;
  while (y < total && i < 8) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(220);
    await page.screenshot({ path: `${OUT}/${r.name}_${String(i).padStart(2, '0')}.png`, fullPage: false });
    y += Math.floor(vh * 0.88);
    i += 1;
  }
}

// Open article page
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
const href = await page.locator('a[href^="/news/"]').first().getAttribute('href');
if (href) {
  await page.goto(BASE + href, { waitUntil: 'networkidle' });
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  let y = 0;
  let i = 0;
  while (y < total && i < 8) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(220);
    await page.screenshot({ path: `${OUT}/article_${String(i).padStart(2, '0')}.png`, fullPage: false });
    y += Math.floor(vh * 0.88);
    i += 1;
  }
}

// Open drawer
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const card = page.locator('[role="button"][aria-label^="Read article"]').first();
if (await card.count()) {
  await card.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/drawer.png`, fullPage: false });
}

await browser.close();
console.log('done');
