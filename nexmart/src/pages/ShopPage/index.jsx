import { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../../context/AppContext';
import { Ic } from '../../components/icons';
import { fetchProducts } from '../../api/products';
import { adaptProducts } from '../../utils/productAdapter';
import { formatPrice } from '../../utils/currency';
import { SkeletonCard, SkeletonListCard } from '../../components/ui/Skeleton';
import { Stars } from '../../components/icons';
import PCard from '../../components/PCard';
import ShopSidebar from '../../components/ShopSidebar';

const MIN_PRICE=0;const MAX_PRICE=2000;

const SORT_OPTS=[
  {v:'featured',l:'Featured'},
  {v:'price-asc',l:'Price: Low–High'},
  {v:'price-desc',l:'Price: High–Low'},
  {v:'rating',l:'⭐ Best Rated'},
  {v:'reviews',l:'💬 Most Reviewed'},
  {v:'newest',l:'🆕 Newest'},
  {v:'discount',l:'🏷 % Discount'},
  {v:'name-az',l:'Name: A→Z'},
  {v:'name-za',l:'Name: Z→A'},
];

export default function ShopPage(){
  const{currency}=useStore();
  const hash=window.location.hash;const params=new URLSearchParams(hash.split('?')[1]||'');const urlCat=params.get('category')||'';
  const[selCats,setSelCats]=useState(urlCat&&urlCat!=='All'?[urlCat]:[]);
  const[priceRange,setPriceRange]=useState([MIN_PRICE,MAX_PRICE]);
  const[ratingF,setRatingF]=useState(0);
  const[selBrands,setSelBrands]=useState([]);
  const[filterColor,setFilterColor]=useState(null);
  const[filterInStock,setFilterInStock]=useState(false);
  const[filterOnSale,setFilterOnSale]=useState(false);
  const[sort,setSort]=useState('featured');
  const[view,setView]=useState('grid');
  const[showF,setShowF]=useState(false);
  const[loading,setLoading]=useState(true);

  const[savedSearches,setSavedSearches]=useState(()=>{try{return JSON.parse(localStorage.getItem('nexmart_searches')||'[]')}catch{return[]}});
  const[showSaved,setShowSaved]=useState(false);
  const savedRef=useRef(null);
  const[visibleCount,setVisibleCount]=useState(20);
  const sentinelRef=useRef(null);
  const[allProducts,setAllProducts]=useState([]);

  useEffect(()=>{
    fetchProducts({limit:100})
      .then(d=>{ setAllProducts(adaptProducts(d?.items||[])); setLoading(false); })
      .catch(()=>setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{if(urlCat&&urlCat!=='All')setSelCats([urlCat]);else setSelCats([])},[urlCat]);
  useEffect(()=>{setLoading(true);const t=setTimeout(()=>setLoading(false),600);return()=>clearTimeout(t)},[selCats,priceRange,ratingF,selBrands,filterColor,filterInStock,filterOnSale,sort]);
  // Reset visible count whenever filters/sort change
  useEffect(()=>{setVisibleCount(20);},[selCats,priceRange,ratingF,selBrands,filterColor,filterInStock,filterOnSale,sort]);
  // IntersectionObserver sentinel for infinite scroll
  useEffect(()=>{
    const el=sentinelRef.current;if(!el)return;
    const obs=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)setVisibleCount(p=>p+12);},{rootMargin:'300px'});
    obs.observe(el);return()=>obs.disconnect();
  },[filtered.length]);
  useEffect(()=>{
    if(!showSaved)return;
    const h=e=>{if(savedRef.current&&!savedRef.current.contains(e.target))setShowSaved(false)};
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[showSaved]);

  const filtered=useMemo(()=>{
    let r=[...allProducts];
    if(selCats.length)r=r.filter(p=>selCats.includes(p.category));
    if(priceRange[0]>MIN_PRICE||priceRange[1]<MAX_PRICE)r=r.filter(p=>p.price>=priceRange[0]&&p.price<=priceRange[1]);
    if(ratingF>0)r=r.filter(p=>p.rating>=ratingF);
    if(selBrands.length)r=r.filter(p=>selBrands.includes(p.brand));
    if(filterColor)r=r.filter(p=>p.colors&&p.colors.some(c=>c.toLowerCase().includes(filterColor.toLowerCase())||filterColor.toLowerCase().includes(c.toLowerCase())));
    if(filterInStock)r=r.filter(p=>p.inStock!==false);
    if(filterOnSale)r=r.filter(p=>p.originalPrice&&p.originalPrice>p.price);
    switch(sort){
      case 'price-asc':  r=[...r].sort((a,b)=>a.price-b.price);break;
      case 'price-desc': r=[...r].sort((a,b)=>b.price-a.price);break;
      case 'rating':     r=[...r].sort((a,b)=>b.rating-a.rating);break;
      case 'reviews':    r=[...r].sort((a,b)=>b.reviews-a.reviews);break;
      case 'newest':     r=[...r].sort((a,b)=>b.id-a.id);break;
      case 'discount':   r=[...r].sort((a,b)=>{const da=a.originalPrice?(1-a.price/a.originalPrice):0;const db=b.originalPrice?(1-b.price/b.originalPrice):0;return db-da;});break;
      case 'name-az':    r=[...r].sort((a,b)=>a.name.localeCompare(b.name));break;
      case 'name-za':    r=[...r].sort((a,b)=>b.name.localeCompare(a.name));break;
    }
    return r;
  },[selCats,priceRange,ratingF,selBrands,filterColor,filterInStock,filterOnSale,sort]);

  const clear=()=>{setSelCats([]);setPriceRange([MIN_PRICE,MAX_PRICE]);setRatingF(0);setSelBrands([]);setFilterColor(null);setFilterInStock(false);setFilterOnSale(false);};

  const chips=[
    ...selCats.map(c=>({l:`Category: ${c}`,rm:()=>setSelCats(p=>p.filter(x=>x!==c))})),
    ...(filterColor?[{l:`Color: ${filterColor}`,rm:()=>setFilterColor(null)}]:[]),
    ...(filterInStock?[{l:'In Stock Only',rm:()=>setFilterInStock(false)}]:[]),
    ...(filterOnSale?[{l:'On Sale',rm:()=>setFilterOnSale(false)}]:[]),
    ...(ratingF>0?[{l:`≥${ratingF}★`,rm:()=>setRatingF(0)}]:[]),
    ...(priceRange[0]>MIN_PRICE||priceRange[1]<MAX_PRICE?[{l:`$${priceRange[0]}–$${priceRange[1]}`,rm:()=>setPriceRange([MIN_PRICE,MAX_PRICE])}]:[]),
    ...selBrands.map(b=>({l:`Brand: ${b}`,rm:()=>setSelBrands(p=>p.filter(x=>x!==b))})),
  ];

  const saveSearch=()=>{
    const entry={id:Date.now(),name:`Search ${savedSearches.length+1}`,selCats,filterColor,filterInStock,filterOnSale,ratingF,priceRange,selBrands,sort,date:new Date().toLocaleDateString()};
    const updated=[...savedSearches,entry];
    setSavedSearches(updated);localStorage.setItem('nexmart_searches',JSON.stringify(updated));
  };
  const restoreSearch=(s)=>{
    setSelCats(s.selCats||[]);setFilterColor(s.filterColor||null);setFilterInStock(!!s.filterInStock);
    setFilterOnSale(!!s.filterOnSale);setRatingF(s.ratingF||0);
    setPriceRange(s.priceRange||[MIN_PRICE,MAX_PRICE]);setSelBrands(s.selBrands||[]);setSort(s.sort||'featured');
    setShowSaved(false);
  };
  const deleteSearch=(id)=>{const u=savedSearches.filter(s=>s.id!==id);setSavedSearches(u);localStorage.setItem('nexmart_searches',JSON.stringify(u));};

  const sidebarProps={selCats,setSelCats,priceRange,setPriceRange,ratingF,setRatingF,selBrands,setSelBrands,filterColor,setFilterColor,filterInStock,setFilterInStock,filterOnSale,setFilterOnSale,clear};

  return(
    <div className="max-w-7xl mx-auto px-4 py-6 anim-fadeIn">
      <div className="flex items-center gap-2 text-sm dm-text-muted mb-5">
        <a href="#/" className="hover:text-accent">Home</a><span>/</span><span className="dm-text font-medium">Shop</span>
        {urlCat&&urlCat!=='All'&&<><span>/</span><span className="dm-text font-medium">{urlCat}</span></>}
      </div>
      <div className="flex gap-6">
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-[130px]"><ShopSidebar {...sidebarProps}/></div>
        </aside>
        {showF&&(
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={()=>setShowF(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-72 dm-card p-5 overflow-auto" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-lg dm-text">Filters</h2><button onClick={()=>setShowF(false)} className="dm-text"><Ic.X s={20}/></button></div>
              <ShopSidebar {...sidebarProps}/>
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {/* Active filter chips */}
          {chips.length>0&&(
            <div className="flex flex-wrap gap-2 mb-3">
              {chips.map((c,i)=><span key={i} className="filter-chip">{c.l}<button onClick={c.rm}>×</button></span>)}
              {chips.length>1&&<button onClick={clear} className="text-xs text-red-500 font-semibold hover:underline self-center ml-1">Clear All</button>}
            </div>
          )}
          {/* Results header */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-sm dm-text-muted">Showing <b className="dm-text">{filtered.length}</b> of {allProducts.length} products</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="lg:hidden relative flex items-center gap-1 px-3 py-1.5 border dm-border rounded-lg text-sm dm-text" onClick={()=>setShowF(true)}>
                <Ic.Filter/> Filters
                {chips.length>0&&<span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">{chips.length}</span>}
              </button>
              <select value={sort} onChange={e=>setSort(e.target.value)} className="px-3 py-1.5 border dm-border rounded-lg text-sm dm-input">
                {SORT_OPTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
              <button onClick={saveSearch} title="Save current filters" className="p-1.5 border dm-border rounded-lg dm-text hover:text-accent transition-colors text-sm">💾</button>
              {savedSearches.length>0&&(
                <div className="relative" ref={savedRef}>
                  <button onClick={()=>setShowSaved(v=>!v)} className="px-2.5 py-1.5 border dm-border rounded-lg text-sm dm-text hover:text-accent transition-colors">
                    📂 <span className="hidden sm:inline">Saved </span>({savedSearches.length})
                  </button>
                  {showSaved&&(
                    <div className="saved-searches-drop">
                      {savedSearches.map(s=>(
                        <div key={s.id} className="saved-search-row">
                          <span className="flex-1 dm-text truncate text-sm" onClick={()=>restoreSearch(s)}>{s.name} — {s.date}</span>
                          <button onClick={()=>deleteSearch(s.id)} className="text-red-400 hover:text-red-600 ml-2 text-xs font-bold">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="hidden sm:flex border dm-border rounded-lg overflow-hidden">
                <button onClick={()=>setView('grid')} className={`p-1.5 ${view==='grid'?'bg-primary text-white':'dm-text-muted'}`}><Ic.Grid/></button>
                <button onClick={()=>setView('list')} className={`p-1.5 ${view==='list'?'bg-primary text-white':'dm-text-muted'}`}><Ic.List/></button>
              </div>
            </div>
          </div>
          {loading?(
            view==='grid'
              ?<div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">{[...Array(6)].map((_,i)=><SkeletonCard key={i} index={i}/>)}</div>
              :<div className="space-y-3">{[...Array(5)].map((_,i)=><SkeletonListCard key={i} index={i}/>)}</div>
          ):filtered.length===0?(
            <div className="text-center py-16"><span className="text-5xl">🔍</span><h3 className="mt-3 font-heading text-xl font-bold dm-text">No products found</h3><p className="mt-1 dm-text-muted text-sm">Try adjusting your filters.</p><button onClick={clear} className="mt-3 px-5 py-2 bg-accent text-white rounded-full text-sm btn-press">Clear Filters</button></div>
          ):view==='grid'?(
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">{filtered.slice(0,visibleCount).map((p,i)=><PCard key={p.id} product={p} index={i}/>)}</div>
              {visibleCount<filtered.length&&<div className="vscroll-more"><span className="vscroll-more-spin"/><span>Loading more…</span></div>}
              <div ref={sentinelRef} className="vscroll-sentinel" aria-hidden="true"/>
            </>
          ):(
            <>
              <div className="space-y-3">{filtered.slice(0,visibleCount).map((p,i)=>(
                <a key={p.id} href={`#/product/${p.id}`} className="flex gap-4 dm-card rounded-xl border dm-border p-3 hover:shadow-lg transition-all anim-fadeInUp" style={{animationDelay:`${i*.04}s`,opacity:0,animationFillMode:'forwards'}}>
                  <img src={p.image} alt="" className="w-28 h-28 object-cover rounded-xl shrink-0"/>
                  <div className="flex-1 min-w-0"><p className="text-xs dm-text-muted uppercase">{p.brand}</p><h3 className="font-semibold dm-text">{p.name}</h3><p className="text-sm dm-text-muted mt-1 line-clamp-2">{p.description}</p><div className="mt-1"><Stars rating={p.rating} showCount count={p.reviews}/></div><div className="mt-1 flex items-center gap-2"><span className="font-bold dm-text">{formatPrice(p.price,currency)}</span>{p.originalPrice&&<span className="text-sm dm-text-muted line-through">{formatPrice(p.originalPrice,currency)}</span>}</div></div>
                </a>
              ))}</div>
              {visibleCount<filtered.length&&<div className="vscroll-more"><span className="vscroll-more-spin"/><span>Loading more…</span></div>}
              <div ref={sentinelRef} className="vscroll-sentinel" aria-hidden="true"/>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
