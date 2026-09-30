import { useEffect, useState } from 'react';
import { fetchProducts } from '../api/products';
import { adaptProducts } from '../utils/productAdapter';
import demoProducts from '../data/demoProducts.json';

const demo = adaptProducts(demoProducts);
let cache = null;
let inflight = null;
const listeners = new Set();
const PAGE_SIZE = 100;

async function fetchWholeCatalog() {
  const first = await fetchProducts({ limit: PAGE_SIZE, page: 1 });
  const items = [...(first?.items || [])];
  const pages = first?.pages || 1;
  if (pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) => fetchProducts({ limit: PAGE_SIZE, page: i + 2 }).catch(() => null))
    );
    for (const page of rest) if (page?.items) items.push(...page.items);
  }
  if (!items.length) return demo;
  const live = adaptProducts(items);
  const liveIds = new Set(live.map(product => String(product.id)));
  // Keep the extended portfolio catalog available even when the older API
  // responds with its original, smaller seed list.
  return [...live, ...demo.filter(product => !liveIds.has(String(product.id)))];
}

function load() {
  if (!inflight) {
    inflight = fetchWholeCatalog().catch(() => demo).then(list => {
      cache = list;
      listeners.forEach(listener => listener(list));
      return list;
    });
  }
  return inflight;
}

/** The catalog is available immediately; live API data replaces the demo snapshot when ready. */
export function useProducts() {
  const [products, setProducts] = useState(cache || demo);
  useEffect(() => {
    listeners.add(setProducts);
    if (cache) setProducts(cache);
    else load();
    return () => listeners.delete(setProducts);
  }, []);
  return products;
}

export function useCategories(limit = 12) {
  const products = useProducts();
  const counts = new Map();
  for (const product of products) {
    if (!product.category) continue;
    const entry = counts.get(product.category) || { name: product.category, count: 0, img: product.image };
    entry.count += 1;
    counts.set(product.category, entry);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export function useProductsWithStatus() {
  const products = useProducts();
  return { products, loading: false };
}
