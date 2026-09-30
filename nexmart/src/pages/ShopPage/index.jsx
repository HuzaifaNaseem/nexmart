import { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../../context/AppContext';
import { Ic, Stars } from '../../components/icons';
import { useProductsWithStatus } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/currency';
import { SkeletonCard, SkeletonListCard } from '../../components/ui/Skeleton';
import PCard from '../../components/PCard';
import ShopSidebar from '../../components/ShopSidebar';
import './shop.css';

const MIN_PRICE = 0;
const MAX_PRICE = Infinity;

const SORT_OPTS = [
  { v: 'featured', l: 'Featured' },
  { v: 'price-asc', l: 'Price: low to high' },
  { v: 'price-desc', l: 'Price: high to low' },
  { v: 'rating', l: 'Best rated' },
  { v: 'reviews', l: 'Most reviewed' },
  { v: 'newest', l: 'Newest' },
  { v: 'discount', l: 'Biggest discount' },
  { v: 'name-az', l: 'Name: A to Z' },
  { v: 'name-za', l: 'Name: Z to A' },
];

const CATEGORY_STORIES = {
  Gaming: { image: '/editorial/technology.jpg', description: 'Make room for a better way to play.' },
  Electronics: { image: '/editorial/technology.jpg', description: 'Smart tools for the way you live now.' },
  Clothing: { image: '/editorial/style.jpg', description: 'Easy pieces with everyday presence.' },
  Fashion: { image: '/editorial/style.jpg', description: 'Easy pieces with everyday presence.' },
  Kitchen: { image: '/editorial/kitchen.jpg', description: 'Objects for every recipe and ritual.' },
  Furniture: { image: '/editorial/living.jpg', description: 'Give every room a little more character.' },
  'Home & Living': { image: '/editorial/living.jpg', description: 'Give every room a little more character.' },
  Sports: { image: '/editorial/sports.jpg', description: 'Ready for your next move.' },
  Books: { image: '/editorial/books.jpg', description: 'A new world is only a page away.' },
  Beauty: { image: '/editorial/style.jpg', description: 'Make a little space for yourself.' },
};

export default function ShopPage() {
  const { currency } = useStore();
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const urlCat = params.get('category') || '';
  const [selCats, setSelCats] = useState(urlCat && urlCat !== 'All' ? [urlCat] : []);
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [ratingF, setRatingF] = useState(0);
  const [selBrands, setSelBrands] = useState([]);
  const [filterColor, setFilterColor] = useState(null);
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterOnSale, setFilterOnSale] = useState(false);
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState('grid');
  const [showF, setShowF] = useState(false);
  const { products: allProducts, loading } = useProductsWithStatus();
  const [savedSearches, setSavedSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexmart_searches') || '[]'); }
    catch { return []; }
  });
  const [showSaved, setShowSaved] = useState(false);
  const savedRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setSelCats(urlCat && urlCat !== 'All' ? [urlCat] : []);
  }, [urlCat]);
  useEffect(() => { setVisibleCount(20); }, [selCats, priceRange, ratingF, selBrands, filterColor, filterInStock, filterOnSale, sort]);
  useEffect(() => {
    if (!showSaved) return;
    const closeOutside = event => {
      if (savedRef.current && !savedRef.current.contains(event.target)) setShowSaved(false);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, [showSaved]);
  useEffect(() => {
    if (!showF) return;
    const closeOnEscape = event => { if (event.key === 'Escape') setShowF(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [showF]);

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    for (const product of allProducts) {
      if (!product.category) continue;
      const entry = counts.get(product.category) || { name: product.category, count: 0, image: product.image };
      entry.count += 1;
      counts.set(product.category, entry);
    }
    return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [allProducts]);
  const catalogMax = useMemo(() => allProducts.reduce((max, product) => Math.max(max, product.price), 0) || Infinity, [allProducts]);

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (selCats.length) result = result.filter(product => selCats.includes(product.category));
    if (priceRange[0] > MIN_PRICE || priceRange[1] < catalogMax) result = result.filter(product => product.price >= priceRange[0] && product.price <= priceRange[1]);
    if (ratingF > 0) result = result.filter(product => product.rating >= ratingF);
    if (selBrands.length) result = result.filter(product => selBrands.includes(product.brand));
    if (filterColor) result = result.filter(product => product.colors?.some(color => color.toLowerCase().includes(filterColor.toLowerCase()) || filterColor.toLowerCase().includes(color.toLowerCase())));
    if (filterInStock) result = result.filter(product => product.inStock !== false);
    if (filterOnSale) result = result.filter(product => product.originalPrice && product.originalPrice > product.price);
    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'reviews': result.sort((a, b) => b.reviews - a.reviews); break;
      case 'newest': result.sort((a, b) => b.id - a.id); break;
      case 'discount': result.sort((a, b) => (b.originalPrice ? 1 - b.price / b.originalPrice : 0) - (a.originalPrice ? 1 - a.price / a.originalPrice : 0)); break;
      case 'name-az': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-za': result.sort((a, b) => b.name.localeCompare(a.name)); break;
    }
    return result;
  }, [allProducts, selCats, priceRange, ratingF, selBrands, filterColor, filterInStock, filterOnSale, sort, catalogMax]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || visibleCount >= filtered.length) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount(previous => Math.min(previous + 12, filtered.length));
    }, { rootMargin: '300px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount]);

  const clear = () => {
    setSelCats([]); setPriceRange([MIN_PRICE, MAX_PRICE]); setRatingF(0);
    setSelBrands([]); setFilterColor(null); setFilterInStock(false); setFilterOnSale(false);
    if (urlCat && urlCat !== 'All') window.location.hash = '#/shop';
  };
  const chips = [
    ...selCats.map(category => ({ label: category, remove: () => {
      setSelCats(previous => previous.filter(item => item !== category));
      if (category === urlCat) window.location.hash = '#/shop';
    } })),
    ...(filterColor ? [{ label: `Color · ${filterColor}`, remove: () => setFilterColor(null) }] : []),
    ...(filterInStock ? [{ label: 'In stock', remove: () => setFilterInStock(false) }] : []),
    ...(filterOnSale ? [{ label: 'On sale', remove: () => setFilterOnSale(false) }] : []),
    ...(ratingF > 0 ? [{ label: `${ratingF} stars & up`, remove: () => setRatingF(0) }] : []),
    ...(priceRange[0] > MIN_PRICE || priceRange[1] < catalogMax ? [{ label: `${formatPrice(priceRange[0], currency)} – ${formatPrice(Number.isFinite(priceRange[1]) ? priceRange[1] : catalogMax, currency)}`, remove: () => setPriceRange([MIN_PRICE, MAX_PRICE]) }] : []),
    ...selBrands.map(brand => ({ label: brand, remove: () => setSelBrands(previous => previous.filter(item => item !== brand)) })),
  ];
  const saveSearch = () => {
    const entry = { id: Date.now(), name: `Saved edit ${savedSearches.length + 1}`, selCats, filterColor, filterInStock, filterOnSale, ratingF, priceRange, selBrands, sort, date: new Date().toLocaleDateString() };
    const updated = [...savedSearches, entry];
    setSavedSearches(updated);
    localStorage.setItem('nexmart_searches', JSON.stringify(updated));
  };
  const restoreSearch = search => {
    setSelCats(search.selCats || []); setFilterColor(search.filterColor || null); setFilterInStock(!!search.filterInStock);
    setFilterOnSale(!!search.filterOnSale); setRatingF(search.ratingF || 0);
    setPriceRange(search.priceRange || [MIN_PRICE, MAX_PRICE]); setSelBrands(search.selBrands || []); setSort(search.sort || 'featured');
    setShowSaved(false);
  };
  const deleteSearch = id => {
    const updated = savedSearches.filter(search => search.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('nexmart_searches', JSON.stringify(updated));
  };
  const sidebarProps = { selCats, setSelCats, priceRange, setPriceRange, ratingF, setRatingF, selBrands, setSelBrands, filterColor, setFilterColor, filterInStock, setFilterInStock, filterOnSale, setFilterOnSale, clear };
  const activeCategory = selCats.length === 1 ? selCats[0] : '';
  const story = CATEGORY_STORIES[activeCategory] || {};
  const heroImage = story.image || '/editorial/living.jpg';
  const visible = Math.min(visibleCount, filtered.length);

  return (
    <main className="nm-shop" id="main-content">
      <div className="nm-shop-shell">
        <nav className="nm-shop-breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Home</a><span aria-hidden="true">/</span><span>{activeCategory || 'Shop'}</span>
        </nav>
        <section className="nm-shop-hero" aria-labelledby="nm-shop-title">
          <div className="nm-shop-hero-copy">
            <span className="nm-shop-eyebrow"><span className="nm-shop-eyebrow-rule" /> THE NEXMART COLLECTION</span>
            <h1 id="nm-shop-title">{activeCategory ? <>Discover<br /><em>{activeCategory}.</em></> : <>The collection,<br /><em>your way.</em></>}</h1>
            <p>{story.description || 'Good finds for all the ways you live. Explore the full collection, then make it yours with filters that put the details first.'}</p>
            <a href="#nm-shop-results" className="nm-shop-hero-link">Explore products <span aria-hidden="true">↘</span></a>
          </div>
          <div className="nm-shop-hero-visual">
            <img src={heroImage} alt={activeCategory ? `${activeCategory} collection` : 'Contemporary furniture and lifestyle collection'} fetchPriority="high" />
            <div className="nm-shop-hero-caption"><span>{activeCategory || 'ALL DEPARTMENTS'}</span><span>THE NEXMART EDIT / 2026</span></div>
          </div>
        </section>

        {categoryCounts.length > 0 && (
          <section className="nm-shop-departments" aria-labelledby="nm-shop-departments-title">
            <div className="nm-shop-departments-heading">
              <div><span className="nm-shop-mini-label">EXPLORE MORE</span><h2 id="nm-shop-departments-title">Find your department.</h2></div>
              <span>{categoryCounts.length} categories to explore</span>
            </div>
            <div className="nm-shop-departments-track">
              {categoryCounts.map(({ name, count, image }, index) => (
                <a key={name} href={`#/shop?category=${encodeURIComponent(name)}`} className={`nm-shop-department ${name === activeCategory ? 'is-current' : ''}`} aria-current={name === activeCategory ? 'page' : undefined}>
                  <span className="nm-shop-department-image"><img src={image} alt="" loading="lazy" decoding="async" /></span>
                  <span className="nm-shop-department-copy"><small>{String(index + 1).padStart(2, '0')} / {count} {count === 1 ? 'item' : 'items'}</small><strong>{name}</strong></span>
                  <span className="nm-shop-department-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="nm-shop-browse" id="nm-shop-results" aria-labelledby="nm-shop-results-title">
          <div className="nm-shop-browse-heading"><span className="nm-shop-mini-label">THE FULL EDIT</span><h2 id="nm-shop-results-title">Explore the collection.</h2><p>Browse freely, or narrow in on exactly what you need.</p></div>
          <div className="nm-shop-layout">
            <aside className="nm-shop-sidebar" aria-label="Product filters">
              <div className="nm-shop-sidebar-head"><strong>Refine your search</strong><span>{chips.length ? `${chips.length} active` : 'All products'}</span></div>
              <ShopSidebar {...sidebarProps} />
            </aside>
            {showF && (
              <div className="nm-shop-filter-overlay" onClick={() => setShowF(false)}>
                <div className="nm-shop-filter-drawer" role="dialog" aria-modal="true" aria-label="Product filters" onClick={event => event.stopPropagation()}>
                  <div className="nm-shop-drawer-head"><h2>Refine your search</h2><button type="button" onClick={() => setShowF(false)} aria-label="Close filters"><Ic.X s={20} /></button></div>
                  <ShopSidebar {...sidebarProps} />
                  <button type="button" className="nm-shop-drawer-done" onClick={() => setShowF(false)}>View {filtered.length} {filtered.length === 1 ? 'product' : 'products'}</button>
                </div>
              </div>
            )}
            <div className="nm-shop-main">
              <div className="nm-shop-toolbar">
                <p aria-live="polite"><strong>{filtered.length}</strong> {filtered.length === 1 ? 'find' : 'finds'} <span>from {allProducts.length} products</span></p>
                <div className="nm-shop-tools">
                  <button type="button" className="nm-shop-filter-trigger" onClick={() => setShowF(true)} aria-label={`Open filters${chips.length ? `, ${chips.length} active` : ''}`}><Ic.Filter s={17} /> Filters {chips.length > 0 && <b>{chips.length}</b>}</button>
                  <label className="nm-shop-sort"><span>Sort by</span><select value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort products">{SORT_OPTS.map(option => <option key={option.v} value={option.v}>{option.l}</option>)}</select></label>
                  <div className="nm-shop-saved" ref={savedRef}>
                    <button type="button" onClick={saveSearch} aria-label="Save current filters" title="Save current filters" className="nm-shop-icon-button"><Ic.Heart s={17} /></button>
                    {savedSearches.length > 0 && <button type="button" onClick={() => setShowSaved(previous => !previous)} aria-expanded={showSaved} className="nm-shop-saved-trigger">Saved <span>{savedSearches.length}</span></button>}
                    {showSaved && savedSearches.length > 0 && <div className="nm-shop-saved-menu" aria-label="Saved filters">{savedSearches.map(search => <div key={search.id}><button type="button" onClick={() => restoreSearch(search)}><strong>{search.name}</strong><small>{search.date}</small></button><button type="button" onClick={() => deleteSearch(search.id)} aria-label={`Delete ${search.name}`}><Ic.X s={15} /></button></div>)}</div>}
                  </div>
                  <div className="nm-shop-view" role="group" aria-label="Product view">
                    <button type="button" onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'} className={view === 'grid' ? 'is-active' : ''}><Ic.Grid s={17} /></button>
                    <button type="button" onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'} className={view === 'list' ? 'is-active' : ''}><Ic.List s={17} /></button>
                  </div>
                </div>
              </div>
              {chips.length > 0 && <div className="nm-shop-chips" aria-label="Active filters">{chips.map((chip, index) => <button key={`${chip.label}-${index}`} type="button" onClick={chip.remove} aria-label={`Remove ${chip.label} filter`}>{chip.label}<Ic.X s={13} /></button>)}<button type="button" className="nm-shop-clear" onClick={clear}>Clear all</button></div>}
              {loading ? (
                view === 'grid' ? <div className="nm-shop-grid">{Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} index={index} />)}</div> : <div className="nm-shop-list">{Array.from({ length: 5 }, (_, index) => <SkeletonListCard key={index} index={index} />)}</div>
              ) : filtered.length === 0 ? (
                <div className="nm-shop-empty"><span><Ic.Search s={30} /></span><small>NO RESULTS</small><h3>Let’s find another way in.</h3><p>Try a different category or remove a filter to see more of the collection.</p><button type="button" onClick={clear}>Reset filters <Ic.Arrow s={16} /></button></div>
              ) : view === 'grid' ? (
                <div className="nm-shop-grid">{filtered.slice(0, visibleCount).map((product, index) => <PCard key={product.id} product={product} index={index} />)}</div>
              ) : (
                <div className="nm-shop-list">{filtered.slice(0, visibleCount).map(product => <a key={product.id} href={`#/product/${product.id}`} className="nm-shop-list-card"><span className="nm-shop-list-image"><img src={product.image} alt="" loading="lazy" /></span><span className="nm-shop-list-details"><small>{product.brand} / {product.category}</small><strong>{product.name}</strong><span className="nm-shop-list-description">{product.description}</span><Stars rating={product.rating} showCount count={product.reviews} /><span className="nm-shop-list-price">{formatPrice(product.price, currency)}{product.originalPrice && <del>{formatPrice(product.originalPrice, currency)}</del>}</span></span><span className="nm-shop-list-arrow" aria-hidden="true">↗</span></a>)}</div>
              )}
              {!loading && filtered.length > 0 && <div className="nm-shop-progress"><span>Showing {visible} of {filtered.length} products</span><div role="progressbar" aria-label="Products shown" aria-valuenow={visible} aria-valuemin={0} aria-valuemax={filtered.length}><span style={{ width: `${visible / filtered.length * 100}%` }} /></div>{visible < filtered.length && <button type="button" onClick={() => setVisibleCount(previous => Math.min(previous + 12, filtered.length))}>Show more products <span aria-hidden="true">↓</span></button>}</div>}
              {visible < filtered.length && <div ref={sentinelRef} className="vscroll-sentinel" aria-hidden="true" />}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
