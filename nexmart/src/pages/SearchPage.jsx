import { useState, useMemo } from 'react';
import { useStore } from '../context/AppContext';
import { useProducts } from '../hooks/useProducts';
import PCard from '../components/PCard';
import { Ic } from '../components/icons';
import { nav } from '../utils/nav';

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

export default function SearchPage() {
  const rawQ = decodeURIComponent(window.location.hash.split('q=')[1] || '');
  const [sort, setSort] = useState('relevance');
  const { currency } = useStore();
  const PRODUCTS = useProducts();

  const results = useMemo(() => {
    const q = rawQ.toLowerCase().trim();
    if (!q) return [];
    let filtered = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
    if (sort === 'price_asc') filtered = filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') filtered = filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered = filtered.sort((a, b) => b.rating - a.rating);
    return filtered;
  }, [rawQ, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 anim-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm dm-text-muted mb-3">
          <a href="#/" className="hover:text-accent">Home</a>
          <span>/</span>
          <span className="dm-text font-medium">Search</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold dm-text">
              {rawQ ? `Results for "${rawQ}"` : 'Search Products'}
            </h1>
            {rawQ && (
              <p className="text-sm dm-text-muted mt-1">
                {results.length} product{results.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          {results.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm dm-text-muted whitespace-nowrap">Sort by:</label>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="dm-input border rounded-lg text-sm px-3 py-1.5"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {!rawQ ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium dm-text">Start searching</p>
          <p className="text-sm dm-text-muted mt-1">Type a keyword in the search bar above</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-lg font-medium dm-text">No results for "{rawQ}"</p>
          <p className="text-sm dm-text-muted mt-1 mb-6">Try a different keyword or browse categories</p>
          <a href="#/shop" className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-semibold rounded-full hover:bg-accent/90 transition-all btn-press">
            Browse All Products <Ic.Arrow s={14}/>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
          {results.map((p, i) => (
            <PCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
