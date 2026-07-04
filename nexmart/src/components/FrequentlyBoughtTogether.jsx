import { useState } from 'react';
import { useStore } from '../context/AppContext';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../utils/currency';
import { Stars } from './icons';

const BUNDLE_DISCOUNT = 0.05; // 5%

export default function FrequentlyBoughtTogether({ mainProduct }) {
  const { currency, dp } = useStore();
  const PRODUCTS = useProducts();

  // Pick up to 2 companions from same category (excluding main)
  const companions = PRODUCTS
    .filter(p => p.category === mainProduct.category && p.id !== mainProduct.id)
    .slice(0, 2);

  const allItems = [mainProduct, ...companions];
  const [selected, setSelected] = useState(new Set(allItems.map(p => p.id)));

  if (companions.length === 0) return null;

  const toggle = (id) => {
    if (id === mainProduct.id) return; // main product always selected
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedItems = allItems.filter(p => selected.has(p.id));
  const totalOriginal = selectedItems.reduce((sum, p) => sum + p.price, 0);
  const discount = selected.size > 1 ? totalOriginal * BUNDLE_DISCOUNT : 0;
  const totalFinal = totalOriginal - discount;

  const addAll = () => {
    selectedItems.forEach(p => {
      dp({ type: 'ADD_CART', p: { pid: p.id, name: p.name, image: p.image, price: p.price, color: '', size: '', qty: 1 } });
    });
    dp({ type: 'NOTIFY', p: { tp: 'success', msg: `✓ ${selectedItems.length} items added to cart` } });
  };

  return (
    <div className="mt-10 p-5 dm-surface rounded-2xl border dm-border">
      <h2 className="font-heading text-lg font-bold dm-text mb-4">Frequently Bought Together</h2>

      <div className="fbt-wrap mb-5">
        {allItems.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            {i > 0 && <span className="fbt-plus">+</span>}
            <div className={`fbt-item ${selected.has(p.id) ? 'selected' : ''}`} onClick={() => toggle(p.id)}>
              <img src={p.image} alt={p.name} className="w-20 h-20 object-cover"/>
              {selected.has(p.id) && <div className="fbt-check">✓</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-4">
        {allItems.map(p => (
          <label key={p.id} className="flex items-center gap-3 cursor-pointer" onClick={() => toggle(p.id)}>
            <input
              type="checkbox"
              checked={selected.has(p.id)}
              readOnly
              disabled={p.id === mainProduct.id}
              className="accent-accent w-4 h-4"
            />
            <img src={p.image} alt="" className="w-8 h-8 object-cover rounded-md"/>
            <span className="text-sm dm-text flex-1 truncate">{p.name}</span>
            <span className="text-sm font-semibold text-accent flex-shrink-0">{formatPrice(p.price, currency)}</span>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t dm-border">
        <div>
          <p className="text-sm dm-text-muted">
            Total:{' '}
            {discount > 0 && (
              <span className="line-through mr-1">{formatPrice(totalOriginal, currency)}</span>
            )}
            <span className="font-bold text-accent text-base">{formatPrice(totalFinal, currency)}</span>
          </p>
          {discount > 0 && (
            <p className="text-xs text-green-600 font-medium mt-0.5">
              Bundle saves you {formatPrice(discount, currency)} (5% off)
            </p>
          )}
        </div>
        <button
          onClick={addAll}
          disabled={selectedItems.length === 0}
          className="px-5 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 btn-press transition-all text-sm disabled:opacity-50"
        >
          Add {selectedItems.length} to Cart
        </button>
      </div>
    </div>
  );
}
