// last edited 2026-05-17 by roshhellwett
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const OUT = 'scripts/editorial-shots';
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { path: '/',                     name: 'home' },
  { path: '/category/politics/',   name: 'category' },
  { path: '/saved/',               name: 'saved' },
  { path: '/how-it-works/',        name: 'how' },
];

async function shoot(label, contextOpts) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(contextOpts);
  const page = await ctx.newPage();
  for (const r of ROUTES) {
    await page.goto(BASE + r.path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${label}_${r.name}_top.png`, fullPage: false });
    // Mid-page snapshot
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.evaluate((y) => window.scrollTo(0, y), Math.floor(total * 0.35));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${label}_${r.name}_mid.png`, fullPage: false });
  }

  // Dark mode home
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('iv-theme', 'dark');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${label}_home_dark.png`, fullPage: false });

  await browser.close();
}

await shoot('mobile', { ...devices['iPhone 13'] });
await shoot('desktop', { viewport: { width: 1366, height: 900 } });
console.log('done');
