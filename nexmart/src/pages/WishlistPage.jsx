import { useStore } from '../context/AppContext';
import { Stars } from '../components/icons';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../utils/currency';

export default function WishlistPage(){
  const{st,dp,currency}=useStore();
  const PRODUCTS=useProducts();
  const items=PRODUCTS.filter(p=>st.wish.includes(p.id));
  if(!items.length)return<div className="max-w-7xl mx-auto px-4 py-20 text-center anim-fadeIn"><span className="text-6xl">💝</span><h2 className="mt-4 font-heading text-2xl font-bold dm-text">Wishlist is Empty</h2><p className="mt-2 dm-text-muted text-sm">Save items you love for later.</p><a href="#/shop" className="mt-4 inline-block px-6 py-2.5 bg-accent text-white rounded-full btn-press">Explore Products</a></div>;
  return(
    <div className="max-w-7xl mx-auto px-4 py-6 anim-fadeIn">
      <h1 className="font-heading text-2xl font-bold dm-text mb-6">My Wishlist ({items.length} items)</h1>
      <div className="space-y-3">
        {items.map((p,i)=>(
          <div key={p.id} className="flex gap-4 p-4 dm-card rounded-xl border dm-border anim-fadeInUp" style={{animationDelay:`${i*.04}s`,opacity:0,animationFillMode:'forwards'}}>
            <a href={`#/product/${p.id}`}><img src={p.image} alt={p.name} className="w-20 h-20 object-contain p-1 dm-surface rounded-xl"/></a>
            <div className="flex-1 min-w-0">
              <p className="text-xs dm-text-muted uppercase">{p.brand}</p>
              <a href={`#/product/${p.id}`}><h3 className="font-semibold dm-text hover:text-accent transition-colors">{p.name}</h3></a>
              <div className="mt-0.5"><Stars rating={p.rating} showCount count={p.reviews}/></div>
              <p className="text-lg font-bold mt-1 dm-text">{formatPrice(p.price,currency)}{p.originalPrice&&<span className="text-sm dm-text-muted line-through ml-2">{formatPrice(p.originalPrice,currency)}</span>}</p>
            </div>
            <div className="flex flex-col gap-2 items-end justify-center shrink-0">
              <button onClick={()=>{dp({type:'ADD_CART',p:{pid:p.id,name:p.name,image:p.image,price:p.price,color:p.colors?.[0]||'',size:p.sizes?.[0]||'',qty:1}});dp({type:'NOTIFY',p:{tp:'success',msg:`✓ ${p.name} added to cart`}})}} className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl btn-press whitespace-nowrap">Add to Cart</button>
              <button onClick={()=>{dp({type:'TOG_WISH',id:p.id});dp({type:'NOTIFY',p:{tp:'success',msg:'Removed from wishlist'}})}} className="px-4 py-2 border dm-border dm-text-muted text-sm font-medium rounded-xl btn-press hover:border-red-400 hover:text-red-500 transition-colors whitespace-nowrap">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
