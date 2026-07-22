import { useEffect, useState } from 'react';
import { fetchProducts } from '../api/products';
import { adaptProducts } from '../utils/productAdapter';

// Module-level cache: every component shares one catalog fetch.
let cache = null;
let inflight = null;
const listeners = new Set();

const PAGE_SIZE = 100; // the API rejects anything larger

/** Walk every page so the catalog is never silently truncated. */
async function fetchWholeCatalog() {
  const first = await fetchProducts({ limit: PAGE_SIZE, page: 1 });
  const items = [...(first?.items || [])];
  const pages = first?.pages || 1;

  if (pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) =>
        fetchProducts({ limit: PAGE_SIZE, page: i + 2 }).catch(() => null)
      )
    );
    for (const page of rest) if (page?.items) items.push(...page.items);
  }
  return adaptProducts(items);
}

function load() {
  if (!inflight) {
    inflight = fetchWholeCatalog()
      .catch(() => [])
      .then(list => {
        cache = list;
        listeners.forEach(fn => fn(list));
        return list;
      });
  }
  return inflight;
}

/** Live product catalog from the API (adapted to the UI shape).
 *  Returns [] until the first fetch resolves. */
export function useProducts() {
  const [products, setProducts] = useState(cache || []);
  useEffect(() => {
    if (cache) { setProducts(cache); return; }
    listeners.add(setProducts);
    load();
    return () => listeners.delete(setProducts);
  }, []);
  return products;
}

/** Categories that actually exist in the catalogue, busiest first.
 *  Each carries a representative product image so navigation never shows a
 *  category that would land the shopper on an empty page. */
export function useCategories(limit = 12) {
  const products = useProducts();
  const counts = new Map();
  for (const p of products) {
    if (!p.category) continue;
    const entry = counts.get(p.category) || { name: p.category, count: 0, img: p.image };
    entry.count += 1;
    counts.set(p.category, entry);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

/** Same data, plus a loading flag for pages that show skeletons. */
export function useProductsWithStatus() {
  const [products, setProducts] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);
  useEffect(() => {
    if (cache) { setProducts(cache); setLoading(false); return; }
    const listener = list => { setProducts(list); setLoading(false); };
    listeners.add(listener);
    load();
    return () => listeners.delete(listener);
  }, []);
  return { products, loading };
}
