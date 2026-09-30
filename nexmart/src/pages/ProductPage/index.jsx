import { useState, useEffect } from 'react';
import { useStore } from '../../context/AppContext';
import { Ic, Stars } from '../../components/icons';
import { colorMap } from '../../data/products';
import { formatPrice } from '../../utils/currency';
import { SkeletonProductPage } from '../../components/ui/Skeleton';
import PCard from '../../components/PCard';
import FrequentlyBoughtTogether from '../../components/FrequentlyBoughtTogether';
import RecentlyViewedRow from '../../components/RecentlyViewedRow';
import LowStockAlert from '../../components/LowStockAlert';
import { addRecentlyViewed } from '../../utils/recentlyViewed';
import { fetchProduct } from '../../api/products';
import { useProducts } from '../../hooks/useProducts';
import { adaptProduct } from '../../utils/productAdapter';
import ProductReviews from '../../components/ProductReviews';
import ProductGallery from '../../components/ProductGallery';

export default function ProductPage(){
  const id = window.location.hash.split('/product/')[1]?.split('?')[0] || '';
  const [remoteProduct, setRemoteProduct] = useState(null);
  const products = useProducts();
  const p = remoteProduct && String(remoteProduct.id) === String(id)
    ? remoteProduct : products.find(item => String(item.id) === String(id));
  const related = p ? products.filter(item => item.category === p.category && item.id !== p.id).slice(0, 4) : [];
  const{st,dp,currency,compareList,toggleCompare}=useStore();
  const[loading,setLoading]=useState(true);
  const[selColor,setSelColor]=useState(0);
  const[selSize,setSelSize]=useState(0);
  const[qty,setQty]=useState(1);

  useEffect(()=>{
    if(!id)return;
    setLoading(true); setRemoteProduct(null);
    addRecentlyViewed(id);
    fetchProduct(id)
      .then(data=>setRemoteProduct(adaptProduct(data)))
      .catch(()=>setRemoteProduct(null))
      .finally(()=>setLoading(false));
  },[id]);
  const[tab,setTab]=useState('desc');
  const[addSt,setAddSt]=useState('idle');
  if(loading && !p)return<SkeletonProductPage/>;
  if(!p)return<div className="text-center py-20"><h2 className="text-xl font-bold dm-text">Product not found</h2><a href="#/shop" className="text-accent mt-2 inline-block">Back to Shop</a></div>;
  const isW=st.wish.includes(p.id);const disc=p.originalPrice&&p.originalPrice>p.price?Math.round((1-p.price/p.originalPrice)*100):0;

  const doAdd=()=>{
    if (!p.inStock || qty > p.stockCount) return;
    dp({type:'ADD_CART',p:{pid:p.id,name:p.name,image:p.image,price:p.price,color:p.colors?.[selColor]||'',size:p.sizes?.[selSize]||'',qty}});
    dp({type:'NOTIFY',p:{tp:'success',msg:`${p.name} added to cart`}});
    setAddSt('added');setTimeout(()=>setAddSt('idle'),1600);
  };


  return(
    <div className="max-w-7xl mx-auto px-4 py-6 anim-fadeIn">
      <div className="flex items-center gap-2 text-sm dm-text-muted mb-5"><a href="#/" className="hover:text-accent">Home</a><span>/</span><a href={`#/shop?category=${encodeURIComponent(p.category)}`} className="hover:text-accent">{p.category}</a><span>/</span><span className="dm-text font-medium truncate">{p.name}</span></div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div><ProductGallery product={p}/></div>
        <div>
          <p className="text-sm text-accent font-medium uppercase tracking-wider">{p.category} / {p.brand}</p>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold dm-text mt-1">{p.name}</h1>
          <div className="mt-2">{p.reviews>0?<Stars rating={p.rating} s={18} showCount count={p.reviews}/>:<span className="text-sm dm-text-muted">New to the collection</span>}</div>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-3xl font-bold dm-text">{formatPrice(p.price,currency)}</span>
            {p.originalPrice&&<><span className="text-lg dm-text-muted line-through">{formatPrice(p.originalPrice,currency)}</span><span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">SAVE {disc}%</span></>}
          </div>
          <LowStockAlert product={p}/>
          <div className="mt-3 rounded-xl border dm-border px-4 py-3 text-sm dm-text-sec">
            <strong className="dm-text">Catalog preview</strong><span className="ml-2">Product details, ratings and availability are illustrative.</span>
          </div>
          <p className="mt-3 dm-text-muted text-sm leading-relaxed">{p.description}</p>
          {p.colors?.length>0&&<div className="mt-5"><p className="text-sm font-semibold dm-text mb-2">Color: <span className="font-normal dm-text-muted">{p.colors[selColor]}</span></p><div className="flex gap-2">{p.colors.map((c,i)=><button key={i} onClick={()=>setSelColor(i)} className={`w-8 h-8 rounded-full border-2 transition-all ${selColor===i?'border-accent ring-2 ring-accent/30':'dm-border'}`} style={{backgroundColor:colorMap[c]||'#ccc'}} title={c}/>)}</div></div>}
          {p.sizes?.length>0&&<div className="mt-5"><p className="text-sm font-semibold dm-text mb-2">Size</p><div className="flex flex-wrap gap-2">{p.sizes.map((s,i)=><button key={i} onClick={()=>setSelSize(i)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all btn-press ${selSize===i?'bg-primary text-white border-primary':'dm-border dm-text-sec hover:border-primary'}`}>{s}</button>)}</div></div>}
          <div className="mt-5"><p className="text-sm font-semibold dm-text mb-2">Quantity</p><div className="flex items-center gap-3"><div className="flex items-center border dm-border rounded-xl"><button onClick={()=>setQty(Math.max(1,qty-1))} className="px-3 py-2 btn-press dm-text"><Ic.Minus/></button><span className="px-3 font-semibold dm-text">{qty}</span><button onClick={()=>setQty(Math.min(p.stockCount,qty+1))} disabled={qty>=p.stockCount} className="px-3 py-2 btn-press dm-text"><Ic.Plus/></button></div><span className="text-sm dm-text-muted">{p.stockCount} available</span></div></div>
          <div className="mt-6 space-y-2.5">
            <button onClick={doAdd} disabled={!p.inStock || addSt!=='idle'} className={`w-full py-3.5 rounded-xl font-semibold text-lg btn-press transition-all ${addSt==='added'?'bg-green-500 text-white':'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/25'}`}>{!p.inStock?'Out of stock':addSt==='idle'?'Add to Cart':'Added to Cart'}</button>
            <button onClick={()=>{dp({type:'TOG_WISH',id:p.id});dp({type:'NOTIFY',p:{tp:'success',msg:isW?'Removed from wishlist':'♥ Added to wishlist'}})}} className={`w-full py-3 rounded-xl font-medium border-2 btn-press transition-all flex items-center justify-center gap-2 ${isW?'border-accent text-accent bg-accent/5':'dm-border dm-text-sec hover:border-accent'}`}>
              <Ic.Heart s={18} f={isW?'#FF4D00':'none'} c={isW?'text-accent':''}/>{isW?'In Your Wishlist':'Add to Wishlist'}
            </button>
            <button onClick={()=>toggleCompare(p.id)} className="w-full py-3 rounded-xl font-medium border dm-border dm-text-sec hover:border-accent transition-colors" aria-pressed={compareList.includes(p.id)}>{compareList.includes(p.id)?'Remove from comparison':'Add to comparison'}</button>
          </div>
          <div className="mt-5 space-y-1.5 p-4 dm-surface rounded-xl text-sm dm-text-muted"><p>Explore multiple product views, save favorites and compare details.</p><p>Shipping and return terms depend on the seller when the store goes live.</p></div>
        </div>
      </div>
      {/* Tabs */}
      <div className="mt-10 border-t dm-border">
        <div className="flex gap-6 border-b dm-border">{['desc','specs','reviews'].map(t=><button key={t} onClick={()=>setTab(t)} className={`py-3 text-sm font-medium capitalize transition-all ${tab===t?'tab-active':'dm-text-muted hover:dm-text'}`}>{t==='desc'?'Description':t==='specs'?'Specifications':'Reviews'}</button>)}</div>
        <div className="py-6">
          {tab==='desc'&&<div className="max-w-2xl anim-fadeIn"><p className="dm-text-muted leading-relaxed">{p.description}</p></div>}
          {tab==='specs'&&<div className="max-w-lg anim-fadeIn space-y-2">{[['Brand',p.brand],['Category',p.category],p.colors&&['Colors',p.colors.join(', ')],p.sizes&&['Sizes',p.sizes.join(', ')],p.reviews>0&&['Rating',`${p.rating}/5 (${p.reviews.toLocaleString()} reviews)`],['Stock',`In Stock (${p.stockCount} units)`]].filter(Boolean).map(([k,v],i)=><div key={i} className="flex justify-between py-2 border-b dm-border"><span className="text-sm dm-text-muted">{k}</span><span className="text-sm font-medium dm-text">{v}</span></div>)}</div>}
          {tab==='reviews'&&<div className="anim-fadeIn"><ProductReviews productId={p.id}/></div>}
        </div>
      </div>
      <FrequentlyBoughtTogether mainProduct={p}/>
      {related.length>0&&<div className="mt-8"><h2 className="font-heading text-xl font-bold dm-text mb-4">You May Also Like</h2><div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">{related.map((r,i)=><PCard key={r.id} product={r} index={i}/>)}</div></div>}
      <RecentlyViewedRow excludeId={p.id}/>
    </div>
  );
}
