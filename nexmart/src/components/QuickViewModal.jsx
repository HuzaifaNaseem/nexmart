import { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/AppContext';
import { Ic, Stars } from './icons';
import { formatPrice } from '../utils/currency';
import { colorMap } from '../data/products';

export default function QuickViewModal({product,onClose}){
  const{st,dp,currency}=useStore();
  const[mainImg,setMainImg]=useState(0);
  const[selColor,setSelColor]=useState(0);
  const[selSize,setSelSize]=useState(0);
  const[qty,setQty]=useState(1);
  const[addSt,setAddSt]=useState('idle');
  const modalRef=useRef(null);
  const p=product;
  const isW=st.wish.includes(p.id);
  const disc=p.originalPrice?Math.round((1-p.price/p.originalPrice)*100):0;

  useEffect(()=>{
    document.body.style.overflow='hidden';
    const handleKey=(e)=>{if(e.key==='Escape')onClose()};
    window.addEventListener('keydown',handleKey);
    return()=>{document.body.style.overflow='';window.removeEventListener('keydown',handleKey)};
  },[onClose]);

  const doAdd=()=>{
    setAddSt('adding');
    setTimeout(()=>{
      dp({type:'ADD_CART',p:{pid:p.id,name:p.name,image:p.image,price:p.price,color:p.colors?.[selColor]||'',size:p.sizes?.[selSize]||'',qty}});
      dp({type:'NOTIFY',p:{tp:'success',msg:`✓ ${p.name} added to cart`}});
      setAddSt('added');
      setTimeout(()=>setAddSt('idle'),2000);
    },500);
  };

  const handleOverlayClick=(e)=>{if(modalRef.current&&!modalRef.current.contains(e.target))onClose()};

  return(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 quickview-overlay" onClick={handleOverlayClick}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div ref={modalRef} className="relative dm-modal rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto quickview-modal">
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-9 h-9 dm-card backdrop-blur rounded-full flex items-center justify-center shadow-md hover:opacity-80 transition-opacity btn-press dm-text">
          <Ic.X s={18}/>
        </button>
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="p-4 md:p-6">
            <div className="aspect-square rounded-xl overflow-hidden dm-surface mb-3">
              <img src={p.images[mainImg]} alt={p.name} className="w-full h-full object-contain p-5 transition-all duration-300"/>
            </div>
            <div className="flex gap-2">
              {p.images.map((img,i)=>(
                <button key={i} onClick={()=>setMainImg(i)} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${mainImg===i?'border-accent ring-1 ring-accent/30':'border-transparent hover:border-gray-300'}`}>
                  <img src={img} alt="" loading="lazy" className="w-full h-full object-contain p-1.5"/>
                </button>
              ))}
            </div>
          </div>
          {/* Product Info */}
          <div className="p-4 md:p-6 md:pl-2 flex flex-col">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider">{p.brand}</p>
            <h2 className="font-heading text-xl sm:text-2xl font-bold dm-text mt-1 leading-tight">{p.name}</h2>
            <div className="mt-2">{p.reviews>0?<Stars rating={p.rating} s={15} showCount count={p.reviews}/>:<span className="text-xs dm-text-muted">New to the collection</span>}</div>
            <div className="mt-3 flex items-center gap-2.5">
              <span className="text-2xl font-bold dm-text">{formatPrice(p.price,currency)}</span>
              {p.originalPrice&&<><span className="text-sm dm-text-muted line-through">{formatPrice(p.originalPrice,currency)}</span><span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">-{disc}%</span></>}
            </div>
            <p className="mt-3 text-sm dm-text-muted leading-relaxed line-clamp-3">{p.description}</p>
            {p.colors&&p.colors.length>0&&(
              <div className="mt-4">
                <p className="text-xs font-semibold dm-text-sec mb-2">Color: <span className="font-normal dm-text-muted">{p.colors[selColor]}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {p.colors.map((c,i)=><button key={i} onClick={()=>setSelColor(i)} className={`w-7 h-7 rounded-full border-2 transition-all ${selColor===i?'border-accent ring-2 ring-accent/30 scale-110':'dm-border hover:scale-105'}`} style={{backgroundColor:colorMap[c]||'#ccc'}} title={c}/>)}
                </div>
              </div>
            )}
            {p.sizes&&p.sizes.length>0&&(
              <div className="mt-4">
                <p className="text-xs font-semibold dm-text-sec mb-2">Size</p>
                <div className="flex gap-1.5 flex-wrap">
                  {p.sizes.map((sz,i)=><button key={i} onClick={()=>setSelSize(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all btn-press ${selSize===i?'bg-primary text-white border-primary':'dm-border dm-text-sec hover:border-primary'}`}>{sz}</button>)}
                </div>
              </div>
            )}
            <div className="mt-4">
              <p className="text-xs font-semibold dm-text-sec mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border dm-border rounded-xl">
                  <button onClick={()=>setQty(Math.max(1,qty-1))} className="px-3 py-1.5 btn-press dm-text-muted hover:text-accent"><Ic.Minus s={14}/></button>
                  <span className="px-3 font-semibold text-sm min-w-[28px] text-center dm-text">{qty}</span>
                  <button onClick={()=>setQty(qty+1)} className="px-3 py-1.5 btn-press dm-text-muted hover:text-accent"><Ic.Plus s={14}/></button>
                </div>
                <span className="text-xs dm-text-muted">{p.stockCount} available</span>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <button onClick={doAdd} disabled={addSt!=='idle'} className={`w-full py-3 rounded-xl font-semibold text-sm btn-press transition-all ${addSt==='added'?'bg-green-500 text-white':'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20'}`}>
                {addSt==='idle'?'Add to Cart':addSt==='adding'?'Adding...':'✓ Added to Cart!'}
              </button>
              <button onClick={()=>{dp({type:'TOG_WISH',id:p.id});dp({type:'NOTIFY',p:{tp:'success',msg:isW?'Removed from wishlist':'♥ Added to wishlist'}})}} className={`w-full py-2.5 rounded-xl text-sm font-medium border-2 btn-press transition-all flex items-center justify-center gap-2 ${isW?'border-accent text-accent bg-accent/5':'dm-border dm-text-muted hover:border-accent hover:text-accent'}`}>
                <Ic.Heart s={16} f={isW?'#FF4D00':'none'} c={isW?'text-accent':''}/>{isW?'In Your Wishlist':'Add to Wishlist'}
              </button>
            </div>
            <a href={`#/product/${p.id}`} onClick={onClose} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline self-start">
              View Full Details <Ic.Arrow s={14}/>
            </a>
            {p.stockCount<15&&<p className="mt-2 text-xs font-medium text-orange-500">🔥 Only {p.stockCount} left in stock</p>}
            <p className="mt-1 text-xs dm-text-muted">🚚 Free shipping on orders over $50</p>
          </div>
        </div>
      </div>
    </div>
  );
}
