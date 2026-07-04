import { useEffect, useState } from 'react';
import { fetchProducts } from '../api/products';
import { adaptProducts } from '../utils/productAdapter';

// Module-level cache: every component shares one catalog fetch.
let cache = null;
let inflight = null;
const listeners = new Set();

function load() {
  if (!inflight) {
    inflight = fetchProducts({ limit: 100 })
      .then(d => adaptProducts(d?.items || []))
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
