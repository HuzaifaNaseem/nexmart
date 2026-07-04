import { useState, useMemo } from 'react';
import { useStore } from '../../context/AppContext';
import { Ic } from '../../components/icons';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/currency';

const PRODUCT_SALES={1:487,2:342,3:198,4:521,5:89,6:245,7:712,8:134,9:67,10:93,11:389,12:201,13:456,14:167};

export default function TopProductsTable({products}){
  const{currency}=useStore();
  const PRODUCTS=useProducts();
  const[sortKey,setSortKey]=useState(null);
  const[sortDir,setSortDir]=useState('asc');
  const handleSort=(key)=>{
    if(sortKey===key){setSortDir(d=>d==='asc'?'desc':'asc');}
    else{setSortKey(key);setSortDir('asc');}
  };
  const sorted=useMemo(()=>{
    const arr=[...PRODUCTS];
    if(sortKey==='name') arr.sort((a,b)=>sortDir==='asc'?a.name.localeCompare(b.name):b.name.localeCompare(a.name));
    else if(sortKey==='price') arr.sort((a,b)=>sortDir==='asc'?a.price-b.price:b.price-a.price);
    return arr;
  },[sortKey,sortDir,PRODUCTS]);
  const SortIcon=({col})=>{if(sortKey!==col)return<Ic.ChevDown s={13}/>;return sortDir==='asc'?<Ic.ChevUp s={13}/>:<Ic.ChevDown s={13}/>;};
  const getStatus=(p)=>{
    if(p.badge)return{label:'Hot',cls:'bg-red-100 text-red-700'};
    if(p.stockCount<15)return{label:'Low Stock',cls:'bg-orange-100 text-orange-700'};
    return{label:'In Stock',cls:'bg-green-100 text-green-700'};
  };

  // When real API top-products data is available, show sales-ranked view
  if(products&&products.length>0){
    return(
      <div className="dm-card rounded-xl border dm-border overflow-hidden anim-fadeInUp" style={{animationDelay:'.25s',opacity:0,animationFillMode:'forwards'}}>
        <div className="p-5 border-b dm-border flex items-center justify-between">
          <div><h3 className="font-semibold dm-text text-base">Top Products</h3><p className="text-xs dm-text-muted mt-0.5">Best sellers by units sold</p></div>
          <a href="#/shop" className="text-xs text-accent font-medium hover:underline">View Store →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="dm-surface text-left">
                <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Rank</th>
                <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Product</th>
                <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Units Sold</th>
                <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y dm-border">
              {products.map((p,i)=>(
                <tr key={p.product_id} className="admin-table-row">
                  <td className="px-5 py-3 text-xs font-bold dm-text-muted">#{i+1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.product_image
                        ?<img src={p.product_image} alt={p.product_name} className="w-10 h-10 rounded-lg object-cover shrink-0"/>
                        :<div className="w-10 h-10 rounded-lg dm-surface shrink-0 flex items-center justify-center"><Ic.ShoppingBag s={16}/></div>
                      }
                      <p className="font-medium dm-text truncate max-w-[220px]">{p.product_name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 dm-text-sec font-medium">{p.total_sold.toLocaleString()}</td>
                  <td className="px-5 py-3 font-semibold dm-text">{formatPrice(p.revenue,currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Fallback: static products view (no orders placed yet)
  return(
    <div className="dm-card rounded-xl border dm-border overflow-hidden anim-fadeInUp" style={{animationDelay:'.25s',opacity:0,animationFillMode:'forwards'}}>
      <div className="p-5 border-b dm-border flex items-center justify-between">
        <div><h3 className="font-semibold dm-text text-base">Top Products</h3><p className="text-xs dm-text-muted mt-0.5">All {PRODUCTS.length} products</p></div>
        <a href="#/shop" className="text-xs text-accent font-medium hover:underline">View Store →</a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="dm-surface text-left">
              <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Product</th>
              <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Category</th>
              <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider sortable-th" onClick={()=>handleSort('price')}><span className="inline-flex items-center gap-1">Price <SortIcon col="price"/></span></th>
              <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Stock</th>
              <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Sales</th>
              <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y dm-border">
            {sorted.map(p=>{
              const status=getStatus(p);
              return(
                <tr key={p.id} className="admin-table-row">
                  <td className="px-5 py-3"><div className="flex items-center gap-3"><img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0"/><div className="min-w-0"><p className="font-medium dm-text truncate max-w-[200px]">{p.name}</p><p className="text-[11px] dm-text-muted">{p.brand}</p></div></div></td>
                  <td className="px-5 py-3"><span className="text-xs dm-text-sec dm-badge-muted px-2 py-1 rounded-md font-medium">{p.category}</span></td>
                  <td className="px-5 py-3 font-semibold dm-text">{formatPrice(p.price,currency)}</td>
                  <td className="px-5 py-3 dm-text-sec">{p.stockCount}</td>
                  <td className="px-5 py-3 dm-text-sec font-medium">{PRODUCT_SALES[p.id]}</td>
                  <td className="px-5 py-3"><span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${status.cls}`}>{status.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
