import { useState } from 'react';
import { useStore } from '../context/AppContext';
import { Ic, Stars } from './icons';
import { formatPrice } from '../utils/currency';
import QuickViewModal from './QuickViewModal';

export default function PCard({product:p,index:idx=0}){
  const{st,dp,currency,compareList,toggleCompare}=useStore();
  const[quickView,setQuickView]=useState(false);
  const isW=st.wish.includes(p.id);
  const disc=p.originalPrice?Math.round((1-p.price/p.originalPrice)*100):0;
  const[imgI,setImgI]=useState(0);
  const addCart=e=>{e.preventDefault();e.stopPropagation();
    dp({type:'ADD_CART',p:{pid:p.id,name:p.name,image:p.image,price:p.price,color:p.colors?.[0]||'',size:p.sizes?.[0]||'',qty:1}});
    dp({type:'NOTIFY',p:{tp:'success',msg:`✓ ${p.name} added to cart`}});
  };
  const openQuickView=(e)=>{e.preventDefault();e.stopPropagation();setQuickView(true)};
  return(
    <>
    <a href={`#/product/${p.id}`} className="product-card block dm-card rounded-xl overflow-hidden border dm-border anim-fadeInUp opacity-0" style={{animationDelay:`${idx*.06}s`,animationFillMode:'forwards'}}
      onMouseEnter={()=>p.images?.length>1&&setImgI(1)} onMouseLeave={()=>setImgI(0)}>
      <div className="relative aspect-square overflow-hidden dm-surface">
        <img src={p.images?.[imgI]||p.image} alt={p.name} className="card-image w-full h-full object-cover" loading="lazy"/>
        {p.badge&&<span className={`absolute top-2 left-2 px-2.5 py-0.5 text-[10px] font-bold rounded-full text-white ${p.badge==='Best Seller'?'bg-primary':p.badge.includes('New')?'bg-accent2':p.badge==='Hot Deal'||p.badge.includes('Sale')?'bg-red-500':p.badge==='Trending'?'bg-pink-500':p.badge==='Limited'?'bg-amber-500':p.badge==='Top Rated'?'bg-green-600':p.badge==='Iconic'||p.badge==='Premium'?'bg-purple-600':'bg-primary'}`}>{p.badge}</span>}
        {disc>0&&<span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">-{disc}%</span>}
        <button onClick={e=>{e.preventDefault();e.stopPropagation();dp({type:'TOG_WISH',id:p.id});dp({type:'NOTIFY',p:{tp:'success',msg:isW?'Removed from wishlist':'♥ Added to wishlist'}})}}
          aria-label={isW?`Remove ${p.name} from wishlist`:`Add ${p.name} to wishlist`}
          className="card-wishlist absolute top-2 right-10 w-7 h-7 rounded-full dm-card flex items-center justify-center shadow-sm hover:scale-110 transition-all">
          <Ic.Heart s={14} f={isW?'#FF4D00':'none'} c={isW?'text-accent':'dm-text-muted'}/>
        </button>
        <div className="card-actions absolute bottom-0 left-0 right-0 p-2.5 space-y-1.5">
          <div className="flex gap-1.5">
            <button onClick={openQuickView} aria-label={`Quick view ${p.name}`} className="flex-1 py-2 dm-card dm-text text-sm font-semibold rounded-lg hover:opacity-90 btn-press flex items-center justify-center gap-1 shadow-sm">
              <Ic.Eye s={14}/> Quick View
            </button>
            <button onClick={e=>{e.preventDefault();e.stopPropagation();toggleCompare(p.id);}}
              aria-label={compareList?.includes(p.id)?`Remove ${p.name} from compare`:`Compare ${p.name}`}
              className={`py-2 px-2.5 text-sm font-semibold rounded-lg btn-press shadow-sm transition-colors ${compareList?.includes(p.id)?'bg-accent text-white':'dm-card dm-text hover:opacity-90'}`}>
              ⚖️
            </button>
          </div>
          <button onClick={addCart} aria-label={`Add ${p.name} to cart`} className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-accent transition-colors btn-press">Add to Cart</button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[10px] dm-text-muted font-medium uppercase tracking-wider">{p.brand}</p>
        <h3 className="text-sm font-semibold dm-text mt-0.5 line-clamp-2 leading-snug">{p.name}</h3>
        <div className="mt-1.5"><Stars rating={p.rating} showCount count={p.reviews}/></div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-base font-bold dm-text">{formatPrice(p.price,currency)}</span>
          {p.originalPrice&&<span className="text-xs dm-text-muted line-through">{formatPrice(p.originalPrice,currency)}</span>}
        </div>
        {p.badge&&<p className="mt-1 text-[11px] font-semibold text-orange-500 flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full anim-pulse2"/>🔥 {p.id*7+23} sold today</p>}
        {p.stockCount<10&&<p className="mt-1 text-[11px] font-medium text-accent">🔥 Only {p.stockCount} left!</p>}
      </div>
    </a>
    {quickView&&<QuickViewModal product={p} onClose={()=>setQuickView(false)}/>}
    </>
  );
}
