import { useState, useRef } from 'react';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/currency';
import { useStore } from '../../context/AppContext';
import CurrencyDropdown from './CurrencyDropdown';

// Emoji per category, matched loosely by keyword. Anything unmapped falls back
// to a neutral mark rather than showing the wrong picture.
const ICONS = [
  [/phone|mobile|tablet/i, '📱'], [/laptop|computer/i, '💻'],
  [/watch/i, '⌚'], [/shoe|sneaker/i, '👟'], [/shirt|top|dress|cloth/i, '👕'],
  [/bag|handbag/i, '👜'], [/jewel|ring/i, '💍'], [/sunglass|glass/i, '🕶'],
  [/fragrance|perfume/i, '🌸'], [/beauty|skin|care/i, '✨'],
  [/furniture|home|decor/i, '🛋'], [/kitchen/i, '🍳'], [/grocer|food/i, '🥑'],
  [/motorcycle|vehicle|car/i, '🏍'], [/sport/i, '🏅'],
];
const iconFor = (name) => (ICONS.find(([re]) => re.test(name)) || [null, '🔎'])[1];

export default function MegaMenu(){
  const PRODUCTS=useProducts();
  const cats=useCategories(8);
  const{currency}=useStore();
  const[active,setActive]=useState(null);
  const timerRef=useRef(null);
  const urlCat=window.location.hash.includes('category=')
    ?decodeURIComponent(window.location.hash.split('category=')[1]?.split('&')[0]||''):'';

  const show=(cat)=>{clearTimeout(timerRef.current);setActive(cat);};
  const hide=()=>{timerRef.current=setTimeout(()=>setActive(null),180);};

  return(
    <div className="max-w-7xl mx-auto px-4 flex items-center h-11 mega-menu-nav">
      <a href="#/shop" onMouseEnter={()=>setActive(null)}
        className={`mega-menu-item ${(!urlCat||urlCat==='All')?'mm-active':''}`}>
        All
      </a>
      {cats.map(c=>{
        const featProds=PRODUCTS.filter(p=>p.category===c.name).slice(0,3);
        const isAct=urlCat===c.name;
        return(
          <div key={c.name} className="relative h-full flex items-center"
            onMouseEnter={()=>show(c.name)} onMouseLeave={hide}>
            <a href={`#/shop?category=${encodeURIComponent(c.name)}`}
              className={`mega-menu-item ${isAct?'mm-active':''}`}>
              <span aria-hidden="true">{iconFor(c.name)}</span> {c.name}
            </a>
            {active===c.name&&featProds.length>0&&(
              <div className="mega-dropdown"
                onMouseEnter={()=>clearTimeout(timerRef.current)} onMouseLeave={hide}>
                <div className="mega-col-subs">
                  <p className="text-[10px] font-bold dm-text-muted uppercase tracking-wider mb-2 px-2">Browse</p>
                  <a href={`#/shop?category=${encodeURIComponent(c.name)}`} className="mega-sub-link">
                    All {c.name} <span className="dm-text-muted">({c.count})</span>
                  </a>
                  <a href={`#/shop?category=${encodeURIComponent(c.name)}`} className="mega-sub-link">Best rated</a>
                  <a href={`#/shop?category=${encodeURIComponent(c.name)}`} className="mega-sub-link">On sale</a>
                </div>
                <div className="mega-col-products">
                  <p className="text-[10px] font-bold dm-text-muted uppercase tracking-wider mb-1">Featured</p>
                  {featProds.map(p=>(
                    <a key={p.id} href={`#/product/${p.id}`} className="mega-prod-item">
                      <img src={p.image} alt={p.name} loading="lazy"/>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold dm-text truncate leading-snug">{p.name}</p>
                        <p className="text-xs font-bold text-accent mt-0.5">{formatPrice(p.price,currency)}</p>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="mega-col-promo">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">{c.name}</p>
                    <p className="text-base font-bold font-heading mt-1 leading-snug">
                      {c.count} {c.count===1?'product':'products'} in stock
                    </p>
                  </div>
                  <a href={`#/shop?category=${encodeURIComponent(c.name)}`}
                    className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-white text-accent text-xs font-bold rounded-full hover:bg-white/90 transition-all self-start">
                    Shop {c.name} →
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div className="ml-auto"><CurrencyDropdown/></div>
    </div>
  );
}
