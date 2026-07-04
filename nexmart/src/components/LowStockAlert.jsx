import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { getNotifyState, setNotifyProduct } from '../utils/notifStorage';

export default function LowStockAlert({ product }) {
  const { addToast } = useToast();
  const [notified, setNotified] = useState(() => !!getNotifyState()[product.id]);

  const stockCount = product.stockCount ?? 20;
  const isLow = stockCount > 0 && stockCount < 5;

  if (!isLow) return null;

  const handleNotify = () => {
    setNotifyProduct(product.id);
    setNotified(true);
    addToast(`We'll notify you when ${product.name} is restocked!`, '🔔');
  };

  return (
    <div className="rounded-xl border-2 border-red-200 bg-red-50 dark:bg-red-900/10 p-4 anim-fadeInUp" style={{animationDelay:'.15s',opacity:0,animationFillMode:'forwards'}}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">🔴</span>
          <span className="text-sm font-bold text-red-600">Low Stock!</span>
        </div>
        <span className="text-xs font-bold text-red-500">Only {stockCount} left</span>
      </div>
      <div className="low-stock-bar bg-red-100 mb-3">
        <div className="low-stock-bar-fill" style={{width:`${Math.min(100,(stockCount/10)*100)}%`}}/>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-red-500">Selling fast — order soon!</p>
        {!notified ? (
          <button
            onClick={handleNotify}
            className="text-xs font-bold text-red-600 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-600 hover:text-white transition-colors btn-press"
          >
            🔔 Notify Me
          </button>
        ) : (
          <span className="text-xs font-bold text-green-600 flex items-center gap-1">✅ Alert set</span>
        )}
      </div>
    </div>
  );
}
