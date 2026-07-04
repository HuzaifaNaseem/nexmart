import { useState, useEffect, useRef } from 'react';
import { useProducts } from '../hooks/useProducts';

const SLIDES = [
  {
    badge: 'Spring Collection 2025',
    title: 'Discover Your',
    accent: 'Style',
    sub: 'Shop 10,000+ premium products from 500+ top brands worldwide. Curated for every lifestyle.',
    cta: 'Shop Now', ctaHref: '#/shop',
    cta2: 'View Deals', cta2Href: '#/shop?category=Electronics',
    stats: [{v:'50K+',l:'Customers'},{v:'500+',l:'Brands'},{v:'4.8⭐',l:'Rating'}],
    bg: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',
    accentColor: '#FF4D00',
  },
  {
    badge: '⚡ Flash Sale — 48h Only',
    title: 'Up to 40% Off',
    accent: 'Top Brands',
    sub: 'Electronics, Fashion, Home & more. Limited time deals you cannot miss — act fast!',
    cta: 'See All Deals', ctaHref: '#/shop',
    cta2: 'Electronics', cta2Href: '#/shop?category=Electronics',
    stats: [{v:'100+',l:'Deals'},{v:'5',l:'Categories'},{v:'48h',l:'Left'}],
    bg: 'linear-gradient(135deg,#FF4D00 0%,#e63946 50%,#c1121f 100%)',
    accentColor: '#ffffff',
  },
  {
    badge: '⭐ Members Rewards',
    title: 'Earn Points on',
    accent: 'Every Order',
    sub: 'Join NEXMART Rewards. Earn up to 3× points and redeem them for real discounts.',
    cta: 'View Rewards', ctaHref: '#/rewards',
    cta2: 'Start Shopping', cta2Href: '#/shop',
    stats: [{v:'4',l:'Tiers'},{v:'3×',l:'Max Points'},{v:'$0.01',l:'Per Point'}],
    bg: 'linear-gradient(135deg,#6366F1 0%,#7c3aed 50%,#4f46e5 100%)',
    accentColor: '#FFD700',
  },
];

export default function HeroCarousel(){
  const[idx,setIdx]=useState(0);
  const timerRef=useRef(null);
  const PRODUCTS=useProducts();
  const heroProds=PRODUCTS.slice(0,4);

  const go=(i)=>setIdx((i+SLIDES.length)%SLIDES.length);
  const reset=()=>{clearInterval(timerRef.current);timerRef.current=setInterval(()=>setIdx(p=>(p+1)%SLIDES.length),5000);};

  useEffect(()=>{reset();return()=>clearInterval(timerRef.current);},[]);

  return(
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
      <div className="hero-carousel">
        {SLIDES.map((sl,i)=>(
          <div key={i} className={`hero-slide ${i===idx?'hs-active':''}`} style={{background:sl.bg}}>
            {/* Left: text content */}
            <div className="flex-1 text-white min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 sm:mb-4"
                style={{background:'rgba(255,255,255,.15)',backdropFilter:'blur(8px)'}}>
                <span className="w-1.5 h-1.5 rounded-full anim-pulse2" style={{background:sl.accentColor}}/>
                <span className="text-[11px] font-semibold uppercase tracking-wider">{sl.badge}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight">
                {sl.title}<br/>
                <span style={{color:sl.accentColor}}>{sl.accent}</span>
              </h1>
              <p className="mt-3 text-xs sm:text-sm lg:text-base opacity-80 max-w-xs hidden sm:block">{sl.sub}</p>
              <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                <a href={sl.ctaHref}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 font-semibold rounded-full text-sm btn-press"
                  style={{background:sl.accentColor,color:sl.bg.includes('#FF4D00')&&i===1?'#fff':'#1a1a2e'}}>
                  {sl.cta} →
                </a>
                <a href={sl.cta2Href}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 font-semibold rounded-full text-sm btn-press"
                  style={{background:'rgba(255,255,255,.15)',color:'#fff',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.3)'}}>
                  {sl.cta2}
                </a>
              </div>
              <div className="mt-5 hidden md:flex gap-6">
                {sl.stats.map(st=>(
                  <div key={st.l}>
                    <span className="text-lg font-bold">{st.v}</span>
                    <p className="text-[11px] opacity-70">{st.l}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Right: product collage */}
            <div className="hidden lg:grid grid-cols-2 gap-2 shrink-0" style={{width:'256px',height:'280px'}}>
              {heroProds.map((p,pi)=>(
                <a key={p.id} href={`#/product/${p.id}`}
                  className={`${pi===0?'row-span-2':''} rounded-xl overflow-hidden block`}
                  style={{height:pi===0?'100%':'auto'}}>
                  <img src={p.image} alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"/>
                </a>
              ))}
            </div>
          </div>
        ))}
        {/* Arrows */}
        <button className="hero-arrow hero-arrow-l" onClick={()=>{go(idx-1);reset();}}>‹</button>
        <button className="hero-arrow hero-arrow-r" onClick={()=>{go(idx+1);reset();}}>›</button>
        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {SLIDES.map((_,i)=>(
            <button key={i} className={`hero-dot ${i===idx?'hd-active':''}`}
              onClick={()=>{go(i);reset();}}/>
          ))}
        </div>
      </div>
    </div>
  );
}
