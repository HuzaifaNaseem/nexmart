import { useState, useRef } from 'react';
import { useProducts } from '../../hooks/useProducts';
import CurrencyDropdown from './CurrencyDropdown';

const MEGA_DATA = [
  {
    cat:'Electronics', icon:'💻',
    subs:['Laptops & Computers','Smartphones','Audio & Headphones','Cameras','Smart Home','Wearables'],
    promoTitle:'Tech Deals', promoSub:'Up to 30% off top tech', promoCta:'Shop Electronics',
  },
  {
    cat:'Fashion', icon:'👗',
    subs:["Women's Clothing","Men's Clothing",'Shoes & Footwear','Bags & Accessories','Jewelry','Watches'],
    promoTitle:'Style Season', promoSub:'New arrivals every day', promoCta:'Shop Fashion',
  },
  {
    cat:'Home & Living', icon:'🏠',
    subs:['Furniture','Kitchen & Dining','Bedding & Bath','Home Décor','Lighting','Storage'],
    promoTitle:'Home Refresh', promoSub:'Fresh looks, great prices', promoCta:'Shop Home',
  },
  {
    cat:'Beauty', icon:'✨',
    subs:['Skincare','Makeup','Hair Care','Fragrance','Wellness','Tools & Devices'],
    promoTitle:'Glow Up', promoSub:'Top beauty picks curated for you', promoCta:'Shop Beauty',
  },
  {
    cat:'Sports', icon:'🏃',
    subs:['Running & Training','Outdoor & Hiking','Yoga & Fitness','Team Sports','Water Sports','Cycling'],
    promoTitle:'Performance Gear', promoSub:'For every athlete', promoCta:'Shop Sports',
  },
];

export default function MegaMenu(){
  const PRODUCTS=useProducts();
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
      {MEGA_DATA.map(m=>{
        const featProds=PRODUCTS.filter(p=>p.category===m.cat).slice(0,3);
        const isAct=urlCat===m.cat;
        return(
          <div key={m.cat} className="relative h-full flex items-center"
            onMouseEnter={()=>show(m.cat)} onMouseLeave={hide}>
            <a href={`#/shop?category=${encodeURIComponent(m.cat)}`}
              className={`mega-menu-item ${isAct?'mm-active':''}`}>
              {m.icon} {m.cat}
            </a>
            {active===m.cat&&(
              <div className="mega-dropdown"
                onMouseEnter={()=>clearTimeout(timerRef.current)} onMouseLeave={hide}>
                {/* Column 1: Sub-categories */}
                <div className="mega-col-subs">
                  <p className="text-[10px] font-bold dm-text-muted uppercase tracking-wider mb-2 px-2">Browse</p>
                  {m.subs.map(s=>(
                    <a key={s} href={`#/shop?category=${encodeURIComponent(m.cat)}`} className="mega-sub-link">
                      {s}
                    </a>
                  ))}
                </div>
                {/* Column 2: Featured Products */}
                <div className="mega-col-products">
                  <p className="text-[10px] font-bold dm-text-muted uppercase tracking-wider mb-1">Featured</p>
                  {featProds.map(p=>(
                    <a key={p.id} href={`#/product/${p.id}`} className="mega-prod-item">
                      <img src={p.image} alt={p.name}/>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold dm-text truncate leading-snug">{p.name}</p>
                        <p className="text-xs font-bold text-accent mt-0.5">${p.price}</p>
                      </div>
                    </a>
                  ))}
                </div>
                {/* Column 3: Promo Banner */}
                <div className="mega-col-promo">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">{m.promoTitle}</p>
                    <p className="text-base font-bold font-heading mt-1 leading-snug">{m.promoSub}</p>
                  </div>
                  <a href={`#/shop?category=${encodeURIComponent(m.cat)}`}
                    className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-white text-[#FF4D00] text-xs font-bold rounded-full hover:bg-white/90 transition-all self-start">
                    {m.promoCta} →
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
