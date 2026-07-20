/**
 * Responsive + render smoke test.
 *
 * Guards two failure modes that unit tests cannot see:
 *   1. A route that throws during render and leaves a blank page.
 *   2. A layout that overflows horizontally, forcing sideways scrolling.
 *
 * Usage:  npm run dev        (in another terminal)
 *         npm run test:responsive
 */
import { chromium } from 'playwright';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:5173';

const VIEWPORTS = [
  { name: 'mobile-sm', w: 320, h: 568 },
  { name: 'mobile', w: 390, h: 844 },
  { name: 'tablet', w: 768, h: 1024 },
  { name: 'laptop', w: 1024, h: 768 },
  { name: 'desktop', w: 1440, h: 900 },
];

const ROUTES = [
  '#/', '#/shop', '#/cart', '#/wishlist', '#/compare',
  '#/search?q=mouse', '#/rewards', '#/account', '#/track', '#/admin',
];

const failures = [];
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    const ctx = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      isMobile: vp.w < 768,
      hasTouch: vp.w < 768,
    });
    const page = await ctx.newPage();
    const jsErrors = [];
    page.on('pageerror', (e) => jsErrors.push(e.message.slice(0, 100)));

    try {
      await page.goto(`${BASE}/${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1500);

      const { els, overflow } = await page.evaluate(() => ({
        els: document.querySelectorAll('body *').length,
        overflow: Math.round(document.documentElement.scrollWidth - window.innerWidth),
      }));

      if (els < 20) failures.push(`${vp.name} ${route} — blank page (${els} elements) ${jsErrors[0] || ''}`);
      else if (overflow > 2) failures.push(`${vp.name} ${route} — horizontal overflow +${overflow}px`);
      else if (jsErrors.length) failures.push(`${vp.name} ${route} — JS error: ${jsErrors[0]}`);
    } catch (e) {
      failures.push(`${vp.name} ${route} — ${e.message.slice(0, 80)}`);
    }
    await ctx.close();
  }
}

await browser.close();

const total = VIEWPORTS.length * ROUTES.length;
if (failures.length) {
  console.error(`\n✗ ${failures.length}/${total} checks failed:\n`);
  failures.forEach((f) => console.error('  ' + f));
  process.exit(1);
}
console.log(`✓ ${total} responsive checks passed (${ROUTES.length} routes × ${VIEWPORTS.length} viewports)`);
