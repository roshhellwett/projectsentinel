// last edited 2026-05-17 by roshhellwett
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const OUT = 'scripts/editorial-shots';
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { path: '/privacy/',     name: 'privacy' },
  { path: '/terms/',       name: 'terms' },
  { path: '/corrections/', name: 'corrections' },
  { path: '/contact/',     name: 'contact' },
  { path: '/this-does-not-exist/', name: '404' },
  { path: '/search/?q=kerala', name: 'search' },
];

async function shoot(label, contextOpts) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(contextOpts);
  const page = await ctx.newPage();
  for (const r of ROUTES) {
    await page.goto(BASE + r.path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${label}_${r.name}_top.png`, fullPage: false });
  }
  await browser.close();
}

await shoot('desktop', { viewport: { width: 1366, height: 900 } });
await shoot('mobile', { ...devices['iPhone 13'] });
console.log('done');
