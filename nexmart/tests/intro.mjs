import { chromium } from 'playwright';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const artifactDir = process.env.TEST_ARTIFACT_DIR || tmpdir();
const browser = await chromium.launch();
const failures = [];

async function check(name, fn) {
  try { await fn(); console.log(`PASS ${name}`); }
  catch (error) { failures.push(`${name}: ${error.message}`); console.error(`FAIL ${name}: ${error.message}`); }
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto(`${base}/#/`, { waitUntil: 'domcontentloaded' });

await check('first visit opens cinematic intro', async () => {
  await page.locator('.nm-intro').waitFor({ state: 'visible', timeout: 3000 });
  if (!await page.getByRole('button', { name: /skip intro/i }).isVisible()) throw new Error('Skip control missing');
  await page.screenshot({ path: join(artifactDir, 'nexmart-intro-desktop.png') });
});

await check('Escape closes intro and restores storefront', async () => {
  await page.keyboard.press('Escape');
  await page.locator('.nm-intro').waitFor({ state: 'detached', timeout: 3000 });
  if (!await page.getByRole('heading', { name: /good things/i }).isVisible()) throw new Error('Storefront not visible');
});

await check('same-session reload skips intro', async () => {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  if (await page.locator('.nm-intro').count()) throw new Error('Intro replayed');
});

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const mobilePage = await mobile.newPage();
mobilePage.on('pageerror', error => errors.push(error.message));
await mobilePage.goto(`${base}/#/shop`, { waitUntil: 'domcontentloaded' });

await check('mobile first visit intro and skip work', async () => {
  await mobilePage.locator('.nm-intro').waitFor({ state: 'visible', timeout: 3000 });
  await mobilePage.screenshot({ path: join(artifactDir, 'nexmart-intro-mobile.png') });
  await mobilePage.getByRole('button', { name: /skip intro/i }).click();
  await mobilePage.locator('.nm-intro').waitFor({ state: 'detached', timeout: 3000 });
  const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 2) throw new Error(`Horizontal overflow: ${overflow}px`);
});

const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const reducedPage = await reduced.newPage();
await reducedPage.goto(`${base}/#/`, { waitUntil: 'domcontentloaded' });
await check('reduced motion opens directly to store', async () => {
  if (await reducedPage.locator('.nm-intro').count()) throw new Error('Intro shown with reduced-motion preference');
});

await check('no browser runtime errors', async () => {
  if (errors.length) throw new Error(errors.join('; '));
});

await Promise.all([desktop.close(), mobile.close(), reduced.close()]);
await browser.close();
if (failures.length) process.exit(1);
