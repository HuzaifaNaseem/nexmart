import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const products = JSON.parse(await readFile(path.join(root, 'src/data/demoProducts.json'), 'utf8'));
const curated = JSON.parse(await readFile(path.join(root, 'src/data/curatedImages.json'), 'utf8'));
if (products.length !== 103 || new Set(products.map(product => product.id)).size !== products.length) {
  throw new Error('Catalog count or product IDs are invalid');
}
for (const product of products) {
  for (const image of product.images) {
    if (image.startsWith('/')) await stat(path.join(root, 'public', image.slice(1)));
  }
}
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ ignoreHTTPSErrors: true });
  await page.addInitScript(() => sessionStorage.setItem('nexmart-opening-seen-v1', '1'));
  await page.goto('http://127.0.0.1:5173/#/shop', { waitUntil: 'domcontentloaded' });
  const images = Object.entries(curated).map(([id, paths]) => ({ id, src: paths[0] }));
  const failures = await page.evaluate(async entries => {
    const failed = [];
    for (const entry of entries) {
      const img = new Image();
      const loaded = await Promise.race([
        new Promise(resolve => {
          img.onload = () => resolve(img.naturalWidth > 0);
          img.onerror = () => resolve(false);
          img.src = entry.src;
        }),
        new Promise(resolve => setTimeout(() => resolve(false), 15000)),
      ]);
      if (!loaded) failed.push(entry);
    }
    return failed;
  }, images);
  if (failures.length) throw new Error(`Failed to decode curated product images: ${JSON.stringify(failures)}`);
  await page.goto('http://127.0.0.1:5173/#/product/1001', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Reviews', exact: true }).click();
  await page.getByText('Reviews will be available when this collection launches.').waitFor();
  if (await page.getByRole('button', { name: 'Write a Review' }).count()) {
    throw new Error('Showcase-only product offers a nonfunctional review form');
  }
  console.log(`PASS ${products.length} unique products and all ${images.length} featured product images load`);
} finally {
  await browser.close();
}
