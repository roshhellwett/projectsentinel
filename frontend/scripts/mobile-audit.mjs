// last edited 2026-05-17 by roshhellwett
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const OUT = 'scripts/mobile-audit';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { label: 'iphone13', opts: { ...devices['iPhone 13'] } },
  { label: 'small360', opts: { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: devices['iPhone 13'].userAgent } },
  { label: 'tablet', opts: { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
];

const ROUTES = ['/', '/category/politics/', '/saved/', '/how-it-works/', '/search?q=india'];

const findings = [];

async function audit(label, contextOpts) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(contextOpts);
  const page = await ctx.newPage();

  for (const route of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(500);
      const safe = route.replace(/[^a-z0-9]/gi, '_') || 'root';
      await page.screenshot({ path: `${OUT}/${label}_${safe}.png`, fullPage: true });

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        const horiz = doc.scrollWidth > doc.clientWidth + 1;
        const offenders = [];
        if (horiz) {
          document.querySelectorAll('*').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.right > doc.clientWidth + 1 && r.width > 4) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : '',
                right: Math.round(r.right),
                width: Math.round(r.width),
              });
            }
          });
        }
        return { horiz, docWidth: doc.scrollWidth, clientWidth: doc.clientWidth, offenders: offenders.slice(0, 12) };
      });
      if (overflow.horiz) {
        findings.push(`[${label}] HORIZONTAL OVERFLOW on ${route} (doc=${overflow.docWidth} vs vw=${overflow.clientWidth})`);
        for (const o of overflow.offenders) findings.push(`    └ <${o.tag}> right=${o.right} w=${o.width} cls="${o.cls}"`);
      }
    } catch (e) {
      findings.push(`[${label}] NAV ${route} :: ${e.message}`);
    }
  }

  // Article page
  try {
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const firstLink = await page.locator('a[href^="/news/"]').first();
    const href = await firstLink.getAttribute('href');
    if (href) {
      await page.goto(BASE + href, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}/${label}_article.png`, fullPage: true });
    }
  } catch (e) {
    findings.push(`[${label}] article :: ${e.message}`);
  }

  await browser.close();
}

for (const v of VIEWPORTS) {
  await audit(v.label, v.opts);
}

if (!findings.length) {
  console.log('MOBILE AUDIT: zero overflow issues');
} else {
  console.log(`MOBILE AUDIT FINDINGS (${findings.length}):`);
  for (const f of findings) console.log(' • ' + f);
}
