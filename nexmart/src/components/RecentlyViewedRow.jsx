import { useStore } from '../context/AppContext';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../utils/currency';
import { Stars } from './icons';
import { getRecentlyViewed } from '../utils/recentlyViewed';
import { nav } from '../utils/nav';


export default function RecentlyViewedRow({ excludeId }) {
  const { currency } = useStore();
  const PRODUCTS = useProducts();
  const ids = getRecentlyViewed().filter(id => id !== excludeId);
  const products = ids.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

  if (products.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-bold dm-text">Recently Viewed</h2>
        <button
          onClick={() => { localStorage.removeItem('nexmart_recent'); window.location.reload(); }}
          className="text-xs dm-text-muted hover:text-accent transition-colors"
        >
          Clear history
        </button>
      </div>
      <div className="rv-scroll">
        {products.map(p => (
          <div key={p.id} className="rv-card" onClick={() => nav(`#/product/${p.id}`)}>
            <div className="aspect-square overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
            </div>
            <div className="p-2.5">
              <p className="text-xs font-medium dm-text truncate leading-tight">{p.name}</p>
              <p className="text-xs dm-text-muted mt-0.5">{p.brand}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs font-bold text-accent">{formatPrice(p.price, currency)}</span>
                <Stars rating={p.rating} s={9}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
