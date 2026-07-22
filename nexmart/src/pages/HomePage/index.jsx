import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../../context/AppContext';
import { Ic, Stars } from '../../components/icons';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/currency';
import { SkeletonCard } from '../../components/ui/Skeleton';
import PCard from '../../components/PCard';
import PurchaseTicker, { getSaleTarget } from '../../components/PurchaseTicker';
import RecentlyViewedRow from '../../components/RecentlyViewedRow';
import HeroCarousel from '../../components/HeroCarousel';
import WhatsHotSection from '../../components/WhatsHotSection';
import PersonalizedSections from '../../components/PersonalizedSections';

const CAT_EMOJI=[
  [/phone|mobile|tablet/i,'📱'],[/laptop|computer/i,'💻'],[/watch/i,'⌚'],
  [/shoe|sneaker/i,'👟'],[/shirt|top|dress|cloth/i,'👕'],[/bag|handbag/i,'👜'],
  [/jewel|ring/i,'💍'],[/sunglass/i,'🕶'],[/fragrance|perfume/i,'🌸'],
  [/beauty|skin/i,'✨'],[/furniture|home|decor/i,'🛋'],[/kitchen/i,'🍳'],
  [/grocer|food/i,'🥑'],[/motorcycle|vehicle/i,'🏍'],[/sport/i,'🏅'],
];

export default function HomePage(){
  const{st,dp,currency}=useStore();
  const PRODUCTS=useProducts();
  const liveCats=useCategories(12);
  const[countdown,setCountdown]=useState({d:0,h:0,m:0,s:0});
  const[featTab,setFeatTab]=useState('All');
  const[email,setEmail]=useState('');
  const[subscribed,setSubscribed]=useState(false);
  const[featLoading,setFeatLoading]=useState(true);
  const targetRef=useRef(getSaleTarget());

  /* ── Featured skeleton (simulates load) ── */
  useEffect(()=>{const t=setTimeout(()=>setFeatLoading(false),1200);return()=>clearTimeout(t)},[]);

  /* ── Countdown Timer (auto-resets when it hits 0) ── */
  useEffect(()=>{
    const iv=setInterval(()=>{
      const diff=Math.max(0,targetRef.current-Date.now());
      if(diff===0){const nt=Date.now()+24*3600*1000;localStorage.setItem('nexmart_sale_target',String(nt));targetRef.current=nt}
      setCountdown({
        d:Math.floor(diff/86400000),
        h:Math.floor((diff%86400000)/3600000),
        m:Math.floor((diff%3600000)/60000),
        s:Math.floor((diff%60000)/1000)
      });
    },1000);
    return()=>clearInterval(iv);
  },[]);

  const featured=useMemo(()=>{
    if(featTab==='All')return PRODUCTS.slice(0,8);
    if(featTab==='New Arrivals')return PRODUCTS.filter(p=>p.badge?.includes('New')||p.badge?.includes('Arrival'));
    if(featTab==='Best Sellers')return PRODUCTS.filter(p=>p.badge==='Best Seller');
    if(featTab==='On Sale')return PRODUCTS.filter(p=>p.originalPrice>p.price);
    return PRODUCTS.slice(0,8);
  },[featTab,PRODUCTS]);

  const saleProducts=PRODUCTS.filter(p=>p.originalPrice).sort((a,b)=>(b.originalPrice-b.price)-(a.originalPrice-a.price)).slice(0,4);
  // Categories, their counts and their artwork all come from the live
  // catalogue — a tile can never advertise a section that has nothing in it.
  const cats=liveCats.slice(0,5).map((c,i)=>({
    ...c,
    emoji:CAT_EMOJI.find(([re])=>re.test(c.name))?.[1]||'🛍',
    trending:i<2,
    // Real brands stocked in this category, shown on hover.
    brands:[...new Set(PRODUCTS.filter(p=>p.category===c.name).map(p=>p.brand).filter(Boolean))].slice(0,4),
  }));
  const brandsList=useMemo(()=>[...new Set(PRODUCTS.map(p=>p.brand).filter(Boolean))].slice(0,9),[PRODUCTS]);
  const reviews=[
    {name:'Sarah M.',av:'SM',r:5,text:'Absolutely love this product! The quality exceeded my expectations. Fast shipping and great packaging.',date:'Jan 15, 2025',prod:'Sony WH-1000XM5'},
    {name:'James K.',av:'JK',r:5,text:"Best purchase I've made this year. The attention to detail is remarkable and customer service was outstanding.",date:'Jan 8, 2025',prod:'MacBook Air M3'},
    {name:'Emily R.',av:'ER',r:4,text:'Great value for the price. Would definitely recommend to anyone looking for premium quality.',date:'Dec 28, 2024',prod:'Nike Air Max 270'}
  ];

  return(
    <div className="anim-fadeIn">

      {/* ── HERO CAROUSEL ── */}
      <HeroCarousel/>

      {/* ── CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="font-heading text-2xl lg:text-3xl font-bold dm-text text-center">Shop by Category</h2>
        <p className="dm-text-muted text-center mt-1 text-sm">Discover curated collections across all categories</p>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {cats.map((c,i)=>(
            <a key={c.name} href={`#/shop?category=${encodeURIComponent(c.name)}`} className="category-card relative h-44 sm:h-52 rounded-2xl overflow-hidden group">
              <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all"/>
              {c.trending&&<span className="cat-trending-badge">🔥 Trending</span>}
              <div className="relative h-full flex flex-col items-center justify-center text-white p-4">
                <span className="text-3xl mb-2">{c.emoji}</span>
                <h3 className="font-heading font-bold text-lg">{c.name}</h3>
                <p className="text-xs text-white/80 mt-0.5">{c.count} Products</p>
                <span className="cat-cta mt-2 text-xs font-semibold flex items-center gap-1">Shop Now →</span>
              </div>
              {c.brands?.length>0&&(
                <div className="cat-hover-tags">
                  {c.brands.map(b=><span key={b} className="cat-tag-pill">{b}</span>)}
                </div>
              )}
            </a>
          ))}
        </div>
      </section>

      {/* ── WHAT'S HOT ── */}
      <WhatsHotSection/>

      {/* ═══ FLASH SALE — COMPLETE ═══ */}
      <section className="my-8 relative overflow-hidden" style={{background:'linear-gradient(135deg, #FF4D00 0%, #e63946 40%, #6366F1 100%)'}}>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',backgroundSize:'60px 60px'}}/>
        <div className="relative max-w-7xl mx-auto px-4 py-10 lg:py-14">
          <div className="text-center text-white mb-8">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold">⚡ FLASH SALE</h2>
            <p className="mt-2 text-white/80 text-sm">Grab these deals before time runs out!</p>

            {/* Countdown Timer */}
            <div className="mt-5 flex justify-center gap-3">
              {[
                {label:'Days',val:String(countdown.d).padStart(2,'0')},
                {label:'Hours',val:String(countdown.h).padStart(2,'0')},
                {label:'Mins',val:String(countdown.m).padStart(2,'0')},
                {label:'Secs',val:String(countdown.s).padStart(2,'0')}
              ].map(t=>(
                <div key={t.label} className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 min-w-[64px] border border-white/10">
                  <span className="text-2xl lg:text-3xl font-bold font-mono">{t.val}</span>
                  <p className="text-[10px] text-white/70 uppercase tracking-wider mt-0.5">{t.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Sale Product Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {saleProducts.map((p,i)=>{
              const disc=Math.round((1-p.price/p.originalPrice)*100);
              return(
                <a key={p.id} href={`#/product/${p.id}`}
                  className="dm-card rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 group anim-fadeInUp"
                  style={{animationDelay:`${i*.1}s`,opacity:0,animationFillMode:'forwards'}}>
                  <div className="relative aspect-square overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">-{disc}%</span>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] dm-text-muted uppercase">{p.brand}</p>
                    <h3 className="text-sm font-semibold dm-text truncate mt-0.5">{p.name}</h3>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-base font-bold text-accent">{formatPrice(p.price,currency)}</span>
                      <span className="text-xs dm-text-muted line-through">{formatPrice(p.originalPrice,currency)}</span>
                    </div>
                    <div className="mt-1"><Stars rating={p.rating} s={11} showCount count={p.reviews}/></div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <h2 className="font-heading text-2xl lg:text-3xl font-bold dm-text">Featured Products</h2>
          <p className="dm-text-muted mt-1 text-sm">Handpicked favorites from our curators</p>
        </div>
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {['All','New Arrivals','Best Sellers','On Sale'].map(t=>(
            <button key={t} onClick={()=>setFeatTab(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all btn-press ${featTab===t?'bg-primary text-white':'dm-surface dm-text-muted hover:opacity-80'}`}>{t}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
          {featLoading
            ?[...Array(8)].map((_,i)=><SkeletonCard key={i} index={i}/>)
            :featured.map((p,i)=><PCard key={p.id} product={p} index={i}/>)}
        </div>
        <div className="text-center mt-8">
          <a href="#/shop" className="inline-flex items-center gap-2 px-7 py-2.5 border-2 dm-border dm-text font-semibold rounded-full hover:bg-primary hover:text-white transition-all btn-press">View All Products <Ic.Arrow s={14}/></a>
        </div>
      </section>

      {/* ── PERSONALIZED SECTIONS ── */}
      <PersonalizedSections/>

      {/* ── TRUST STRIP ── */}
      <section className="dm-surface py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ic:'🚚',t:'Free Delivery',d:'On orders over $50'},{ic:'🔄',t:'Easy Returns',d:'30-day return policy'},{ic:'🔒',t:'Secure Payment',d:'256-bit SSL encryption'},{ic:'💬',t:'24/7 Support',d:'Always here to help'}].map((f,i)=>(
            <div key={i} className="text-center p-5 dm-card rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl">{f.ic}</span>
              <h3 className="mt-2 font-semibold dm-text text-sm">{f.t}</h3>
              <p className="mt-0.5 text-xs dm-text-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ BRANDS CAROUSEL — COMPLETE ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-10 overflow-hidden">
        <h2 className="font-heading text-2xl font-bold dm-text text-center mb-8">Trusted by Top Brands</h2>
        <div className="relative overflow-hidden" style={{maskImage:'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'}}>
          <div className="brand-track whitespace-nowrap">
            {[...brandsList,...brandsList,...brandsList,...brandsList].map((b,i)=>(
              <span key={i} className="inline-block mx-6 lg:mx-10 font-heading text-xl lg:text-2xl font-bold dm-text-muted hover:text-accent transition-colors duration-300 cursor-pointer select-none">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="dm-surface py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-2xl lg:text-3xl font-bold dm-text text-center">What Our Customers Say</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {reviews.map((r,i)=>(
              <div key={i} className="dm-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <Stars rating={r.r}/>
                <p className="mt-3 dm-text-muted text-sm leading-relaxed">"{r.text}"</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white text-xs font-bold">{r.av}</div>
                  <div><p className="text-sm font-semibold dm-text">{r.name} <span className="text-blue-500 text-[10px]">✓ Verified</span></p><p className="text-xs dm-text-muted">{r.prod}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENTLY VIEWED ── */}
      <section className="max-w-7xl mx-auto px-4"><RecentlyViewedRow/></section>

      {/* ═══ NEWSLETTER — COMPLETE ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="bg-gradient-to-r from-primary to-gray-800 rounded-3xl p-8 lg:p-14 text-center text-white">
          <h2 className="font-heading text-2xl lg:text-3xl font-bold">Get Exclusive Deals in Your Inbox</h2>
          <p className="mt-2 text-gray-300 text-sm">Subscribe and get 15% off your first order + access to members-only deals</p>
          {subscribed?(
            <div className="mt-6 anim-scaleIn">
              <span className="text-5xl">🎉</span>
              <p className="mt-2 font-semibold text-lg">Thank you for subscribing!</p>
              <p className="text-sm text-gray-300 mt-1">Check your inbox for your discount code.</p>
            </div>
          ):(
            <form onSubmit={e=>{e.preventDefault();if(email.includes('@')){setSubscribed(true);dp({type:'NOTIFY',p:{tp:'success',msg:'🎉 Subscribed! Check your inbox.'}})}}} className="mt-6 flex max-w-md mx-auto">
              <input type="email" required placeholder="Enter your email" value={email} onChange={e=>setEmail(e.target.value)} className="flex-1 px-5 py-3 rounded-l-full text-gray-900 text-sm focus:outline-none"/>
              <button type="submit" className="px-6 py-3 bg-accent text-white font-semibold rounded-r-full hover:bg-accent/90 transition-colors btn-press">Subscribe</button>
            </form>
          )}
          <p className="mt-4 text-xs text-gray-400">Join 50,000+ subscribers · No spam, unsubscribe anytime</p>
        </div>
      </section>
      <PurchaseTicker/>
    </div>
  );
}
