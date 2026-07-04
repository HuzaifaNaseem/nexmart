import { useMemo } from 'react';
import { useStore } from '../context/AppContext';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../utils/currency';

export default function PersonalizedSections(){
  const{st,currency}=useStore();
  const PRODUCTS=useProducts();

  // "Complete the Look": products from same categories as cart items, not already in cart
  const completeLook=useMemo(()=>{
    const cartIds=st.cart.map(c=>c.pid);
    const cartCats=[...new Set(
      st.cart.map(item=>PRODUCTS.find(p=>p.id===item.pid)?.category).filter(Boolean)
    )];
    if(!cartCats.length)return[];
    return PRODUCTS
      .filter(p=>cartCats.includes(p.category)&&!cartIds.includes(p.id))
      .slice(0,4);
  },[st.cart]);

  // "Wishlist on Sale": wishlisted products with a discount
  const wishSale=useMemo(()=>
    PRODUCTS.filter(p=>st.wish.includes(p.id)&&p.originalPrice&&p.originalPrice>p.price)
  ,[st.wish]);

  if(!completeLook.length&&!wishSale.length)return null;

  return(
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className={`grid gap-6 ${completeLook.length&&wishSale.length?'md:grid-cols-2':''}`}>
        {completeLook.length>0&&(
          <div className="dm-surface rounded-2xl p-5">
            <h2 className="font-heading font-bold text-lg dm-text mb-0.5">Complete the Look</h2>
            <p className="text-xs dm-text-muted mb-4">Based on items in your cart</p>
            <div className="space-y-2">
              {completeLook.map(p=>(
                <a key={p.id} href={`#/product/${p.id}`} className="personal-card">
                  <img src={p.image} alt={p.name} loading="lazy"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] dm-text-muted uppercase">{p.brand}</p>
                    <p className="text-sm font-semibold dm-text truncate">{p.name}</p>
                    <p className="text-sm font-bold text-accent mt-0.5">{formatPrice(p.price,currency)}</p>
                  </div>
                  <span className="text-xs text-accent font-semibold shrink-0">View →</span>
                </a>
              ))}
            </div>
          </div>
        )}
        {wishSale.length>0&&(
          <div className="dm-surface rounded-2xl p-5">
            <h2 className="font-heading font-bold text-lg dm-text mb-0.5">♥ Wishlist on Sale</h2>
            <p className="text-xs dm-text-muted mb-4">Your saved items now have discounts!</p>
            <div className="space-y-2">
              {wishSale.map(p=>{
                const disc=Math.round((1-p.price/p.originalPrice)*100);
                return(
                  <a key={p.id} href={`#/product/${p.id}`} className="personal-card">
                    <img src={p.image} alt={p.name} loading="lazy"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] dm-text-muted uppercase">{p.brand}</p>
                      <p className="text-sm font-semibold dm-text truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-accent">{formatPrice(p.price,currency)}</span>
                        <span className="text-xs dm-text-muted line-through">{formatPrice(p.originalPrice,currency)}</span>
                        <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">-{disc}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-accent font-semibold shrink-0">View →</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
