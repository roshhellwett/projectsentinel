// last edited 2026-05-17 by roshhellwett
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const ID = process.env.POST_ID || 'c9b4abff-710e-44be-8a64-0eedd9362ff1';
const OUT = 'scripts/editorial-shots';
mkdirSync(OUT, { recursive: true });

async function shoot(label, contextOpts) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(contextOpts);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/news/${ID}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${label}_article_top.png`, fullPage: false });
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.floor(total * 0.45));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${label}_article_mid.png`, fullPage: false });
  await browser.close();
}

await shoot('desktop', { viewport: { width: 1366, height: 900 } });
await shoot('mobile', { ...devices['iPhone 13'] });
console.log('done');
