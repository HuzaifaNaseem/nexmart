import { useStore } from '../context/AppContext';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../utils/currency';
import { Stars } from '../components/icons';

export default function ComparePage(){
  const{compareList,toggleCompare,clearCompare,dp,currency}=useStore();
  const PRODUCTS=useProducts();
  const items=compareList.map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean);

  if(items.length===0)return(
    <div className="max-w-4xl mx-auto px-4 py-20 text-center anim-fadeIn">
      <span className="text-5xl">⚖️</span>
      <h2 className="mt-4 font-heading text-2xl font-bold dm-text">No products to compare</h2>
      <p className="mt-2 dm-text-muted">Add products from the shop to compare them side by side.</p>
      <a href="#/shop" className="mt-5 inline-block px-6 py-2.5 bg-accent text-white font-semibold rounded-full btn-press">Browse Shop</a>
    </div>
  );

  const bestPrice=Math.min(...items.map(p=>p.price));
  const bestRating=Math.max(...items.map(p=>p.rating));
  const bestReviews=Math.max(...items.map(p=>p.reviews));

  const rows=[
    {label:'Price',     render:p=>formatPrice(p.price,currency),          best:p=>p.price===bestPrice},
    {label:'Was',       render:p=>p.originalPrice?formatPrice(p.originalPrice,currency):'—',best:()=>false},
    {label:'Discount',  render:p=>p.originalPrice?`${Math.round((1-p.price/p.originalPrice)*100)}% off`:'—',
     best:p=>{const d=p.originalPrice?(1-p.price/p.originalPrice):0;const max=Math.max(...items.map(x=>x.originalPrice?(1-x.price/x.originalPrice):0));return d>0&&d===max;}},
    {label:'Rating',    render:p=><Stars rating={p.rating} showCount count={p.reviews}/>, best:p=>p.rating===bestRating},
    {label:'Reviews',   render:p=>`${p.reviews.toLocaleString()}`, best:p=>p.reviews===bestReviews},
    {label:'Brand',     render:p=>p.brand,   best:()=>false},
    {label:'Category',  render:p=>p.category,best:()=>false},
    {label:'Colors',    render:p=>(p.colors||[]).join(', ')||'—',best:()=>false},
    {label:'Sizes',     render:p=>(p.sizes||[]).join(', ')||'—', best:()=>false},
    {label:'In Stock',  render:p=>p.inStock?<span className="text-green-600 font-semibold">✓ Yes</span>:<span className="text-red-500">✗ No</span>,best:()=>false},
    {label:'Description',render:p=><span className="text-xs dm-text-muted">{p.description}</span>,best:()=>false},
  ];

  const addCart=(p)=>{
    dp({type:'ADD_CART',p:{pid:p.id,name:p.name,image:p.image,price:p.price,color:p.colors?.[0]||'',size:p.sizes?.[0]||'',qty:1}});
    dp({type:'NOTIFY',p:{tp:'success',msg:`✓ ${p.name} added to cart`}});
  };

  return(
    <div className="max-w-7xl mx-auto px-4 py-6 anim-fadeIn">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold dm-text">⚖️ Compare Products</h1>
        <div className="flex gap-2">
          <a href="#/shop" className="px-4 py-2 border dm-border dm-text text-sm font-medium rounded-xl btn-press">← Back to Shop</a>
          <button onClick={()=>{clearCompare();window.location.hash='#/shop';}} className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl btn-press">🗑 Clear All</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border dm-border">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="dm-surface"></th>
              {items.map(p=>(
                <td key={p.id} className="text-center dm-card" style={{minWidth:180}}>
                  <img src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded-xl mx-auto mb-2"/>
                  <p className="font-bold dm-text text-sm">{p.name}</p>
                  <p className="text-xs dm-text-muted mt-0.5">{p.brand}</p>
                  <button onClick={()=>toggleCompare(p.id)} className="mt-2 text-xs text-red-500 hover:underline">× Remove</button>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row=>(
              <tr key={row.label}>
                <th>{row.label}</th>
                {items.map(p=>(
                  <td key={p.id} className={row.best(p)?'best-val':''}>
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th>Action</th>
              {items.map(p=>(
                <td key={p.id} className="text-center">
                  <button onClick={()=>addCart(p)} className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl btn-press">🛒 Add to Cart</button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
