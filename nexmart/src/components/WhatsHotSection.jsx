import { useMemo } from 'react';
import { useStore } from '../context/AppContext';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../utils/currency';

export default function WhatsHotSection(){
  const{currency}=useStore();
  const PRODUCTS=useProducts();

  const hotProds=useMemo(()=>{
    const hot=PRODUCTS.filter(p=>
      p.badge==='Hot Deal'||p.badge==='Trending'||p.badge==='Best Seller'||p.badge?.includes('Sale')
    );
    if(hot.length>=3)return hot.slice(0,3);
    return PRODUCTS.slice(2,5);
  },[PRODUCTS]);

  if(hotProds.length<3)return null;
  const[large,...smalls]=hotProds;

  return(
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-heading text-2xl lg:text-3xl font-bold dm-text">🔥 What's Hot</h2>
          <p className="dm-text-muted text-sm mt-0.5">Editor's picks — trending right now</p>
        </div>
        <a href="#/shop" className="text-sm font-semibold text-accent hover:underline hidden sm:block">View All →</a>
      </div>
      <div className="hot-grid">
        {/* Large card */}
        <a href={`#/product/${large.id}`} className="hot-card-lg">
          <img src={large.image} alt={large.name}
            className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>
          <div className="hot-overlay"/>
          <div className="hot-body">
            <span className="hot-tag">{large.badge||'Trending'}</span>
            <h3 className="text-white font-heading font-bold text-xl leading-snug">{large.name}</h3>
            <p className="text-white/70 text-sm mt-0.5">{large.brand}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-white font-bold text-lg">{formatPrice(large.price,currency)}</span>
              {large.originalPrice&&(
                <span className="text-white/60 text-sm line-through">{formatPrice(large.originalPrice,currency)}</span>
              )}
            </div>
          </div>
        </a>
        {/* Small cards */}
        {smalls.map(p=>(
          <a key={p.id} href={`#/product/${p.id}`} className="hot-card-sm">
            <img src={p.image} alt={p.name}
              className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>
            <div className="hot-overlay"/>
            <div className="hot-body">
              <span className="hot-tag">{p.badge||'Hot'}</span>
              <h3 className="text-white font-heading font-bold text-base leading-snug">{p.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-white font-bold">{formatPrice(p.price,currency)}</span>
                {p.originalPrice&&(
                  <span className="text-white/60 text-xs line-through">{formatPrice(p.originalPrice,currency)}</span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
