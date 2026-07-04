import { useEffect, useRef } from 'react';
import { useStore } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/currency';
import { nav } from '../../utils/nav';

const TRENDING = ['Wireless Headphones', 'MacBook', 'Nike Sneakers', 'Smart Watch', 'Camera'];

function HighlightText({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="search-highlight">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchDropdown({ query, onClose, focusIdx, setFocusIdx }) {
  const { currency } = useStore();
  const PRODUCTS = useProducts();
  const dropRef = useRef();

  const results = query.length > 1
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  // Group by category
  const grouped = results.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const flatItems = results; // flat list for keyboard nav

  const goTo = (p) => {
    nav(`#/product/${p.id}`);
    onClose();
  };

  const doSearch = (q) => {
    nav(`#/search?q=${encodeURIComponent(q)}`);
    onClose();
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIdx(i => Math.min(flatItems.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIdx(i => Math.max(-1, i - 1));
      } else if (e.key === 'Enter') {
        if (focusIdx >= 0 && flatItems[focusIdx]) {
          goTo(flatItems[focusIdx]);
        } else if (query.trim()) {
          doSearch(query.trim());
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusIdx, flatItems, query]);

  return (
    <div className="search-dropdown" ref={dropRef}>
      {query.length > 1 ? (
        results.length > 0 ? (
          <>
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <p className="search-cat-header">{cat}</p>
                {items.map((p, i) => {
                  const globalIdx = flatItems.indexOf(p);
                  return (
                    <div
                      key={p.id}
                      className="search-result-item"
                      style={globalIdx === focusIdx ? { background: 'var(--bg-surface)' } : {}}
                      onClick={() => goTo(p)}
                    >
                      <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium dm-text truncate">
                          <HighlightText text={p.name} query={query} />
                        </p>
                        <p className="text-xs dm-text-muted">{p.brand}</p>
                      </div>
                      <span className="text-sm font-bold text-accent flex-shrink-0">{formatPrice(p.price, currency)}</span>
                    </div>
                  );
                })}
              </div>
            ))}
            <div
              className="flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-accent hover:opacity-80 cursor-pointer border-t dm-border"
              onClick={() => doSearch(query)}
            >
              See all results for "<strong>{query}</strong>" →
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm font-medium dm-text">No results for "{query}"</p>
            <p className="text-xs dm-text-muted mt-1">Try a different keyword</p>
          </div>
        )
      ) : (
        <div className="p-4">
          <p className="search-cat-header mb-2">Trending Searches</p>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map(t => (
              <button key={t} className="trending-tag" onClick={() => doSearch(t)}>
                🔥 {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
