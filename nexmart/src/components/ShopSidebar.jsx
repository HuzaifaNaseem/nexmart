import { useMemo } from 'react';
import { colorMap } from '../data/products';
import { useProducts } from '../hooks/useProducts';

/** Round a price up to a friendly slider bound (1999.99 -> 2000, 36999 -> 37000). */
function ceilNice(n) {
  if (n <= 100) return 100;
  const mag = Math.pow(10, Math.floor(Math.log10(n)) - 1);
  return Math.ceil(n / mag) * mag;
}

export default function ShopSidebar({
  selCats, setSelCats,
  priceRange, setPriceRange,
  ratingF, setRatingF,
  selBrands, setSelBrands,
  filterColor, setFilterColor,
  filterInStock, setFilterInStock,
  filterOnSale, setFilterOnSale,
  clear,
}){
  const PRODUCTS=useProducts();

  // Every facet is derived from the catalogue that is actually loaded, so the
  // sidebar can never advertise a filter that matches nothing.
  const {categories,brands,colors,maxPrice}=useMemo(()=>{
    const catCount=new Map();
    const brandSet=new Set();
    const colorSet=new Set();
    let max=0;
    for(const p of PRODUCTS){
      if(p.category) catCount.set(p.category,(catCount.get(p.category)||0)+1);
      if(p.brand) brandSet.add(p.brand);
      (p.colors||[]).forEach(c=>colorSet.add(c));
      if(p.price>max) max=p.price;
    }
    return {
      categories:[...catCount.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])),
      brands:[...brandSet].sort((a,b)=>a.localeCompare(b)),
      colors:[...colorSet],
      maxPrice:max?ceilNice(max):2000,
    };
  },[PRODUCTS]);

  const step=maxPrice>5000?100:10;
  const hi=Math.min(priceRange[1],maxPrice);
  const fillLeft  = (priceRange[0]/maxPrice)*100;
  const fillWidth = ((hi-priceRange[0])/maxPrice)*100;

  const money=n=>n>=1000?`$${(n/1000).toFixed(n%1000?1:0)}k`:`$${n}`;

  return(
    <div className="space-y-5">

      {/* Category */}
      {categories.length>0&&(
        <><div>
          <h3 className="font-semibold text-sm mb-2 dm-text">Category</h3>
          <div className="max-h-64 overflow-y-auto pr-1">
            {categories.map(([c,n])=>(
              <label key={c} className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="checkbox" checked={selCats.includes(c)} onChange={()=>setSelCats(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c])} className="w-4 h-4 rounded text-accent"/>
                <span className="text-sm dm-text-sec">{c}</span>
                <span className="ml-auto text-xs dm-text-muted">{n}</span>
              </label>
            ))}
          </div>
        </div><hr className="dm-border"/></>
      )}

      {/* Price Range (dual slider) */}
      <div>
        <h3 className="font-semibold text-sm mb-2 dm-text">Price Range</h3>
        <div className="flex justify-between text-xs dm-text-muted mb-2 font-semibold">
          <span>{money(priceRange[0])}</span><span>{money(hi)}{hi>=maxPrice?'+':''}</span>
        </div>
        <div className="dual-range">
          <div className="range-track"/>
          <div className="range-track-fill" style={{left:`${fillLeft}%`,width:`${fillWidth}%`}}/>
          <input type="range" aria-label="Minimum price" min={0} max={maxPrice} step={step} value={priceRange[0]}
            onChange={e=>setPriceRange([Math.min(+e.target.value,hi-step),hi])}/>
          <input type="range" aria-label="Maximum price" min={0} max={maxPrice} step={step} value={hi}
            onChange={e=>setPriceRange([priceRange[0],Math.max(+e.target.value,priceRange[0]+step)])}/>
        </div>
      </div><hr className="dm-border"/>

      {/* Color — only shown when the catalogue actually carries colour data */}
      {colors.length>0&&(
        <><div>
          <h3 className="font-semibold text-sm mb-2 dm-text">Color</h3>
          <div className="flex flex-wrap gap-2">
            {colors.slice(0,15).map(name=>{
              const isLight=['White','Starlight','Champagne','Cream Bouclé','Silver','Chrome','Cool Gray'].includes(name);
              return(
                <button key={name} title={name} aria-label={`Filter by colour ${name}`} aria-pressed={filterColor===name}
                  className={`color-swatch ${isLight?'color-swatch-light':''} ${filterColor===name?'active':''}`}
                  style={{backgroundColor:colorMap[name]||'#999'}}
                  onClick={()=>setFilterColor(filterColor===name?null:name)}
                />
              );
            })}
          </div>
          {filterColor&&<p className="text-xs dm-text-muted mt-1.5">Color: <span className="font-semibold text-accent">{filterColor}</span></p>}
        </div><hr className="dm-border"/></>
      )}

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-sm mb-2 dm-text">Rating</h3>
        {[{r:0,l:'All'},{r:4,l:'4★ & above'},{r:3,l:'3★ & above'}].map(({r,l})=>(
          <label key={r} className="flex items-center gap-2 py-1 cursor-pointer">
            <input type="radio" name="rat" checked={ratingF===r} onChange={()=>setRatingF(r)} className="w-4 h-4 text-accent"/>
            <span className="text-sm dm-text-sec">{l}</span>
          </label>
        ))}
      </div><hr className="dm-border"/>

      {/* Toggles */}
      <div className="space-y-2">
        <label className="flex items-center justify-between py-1 cursor-pointer">
          <span className="text-sm dm-text-sec">In Stock Only</span>
          <button type="button" role="switch" aria-checked={filterInStock} aria-label="In stock only"
            className={`shop-toggle ${filterInStock?'active':''}`} onClick={()=>setFilterInStock(v=>!v)}/>
        </label>
        <label className="flex items-center justify-between py-1 cursor-pointer">
          <span className="text-sm dm-text-sec">On Sale Only</span>
          <button type="button" role="switch" aria-checked={filterOnSale} aria-label="On sale only"
            className={`shop-toggle ${filterOnSale?'active':''}`} onClick={()=>setFilterOnSale(v=>!v)}/>
        </label>
      </div><hr className="dm-border"/>

      {/* Brand */}
      {brands.length>0&&(
        <div>
          <h3 className="font-semibold text-sm mb-2 dm-text">Brand</h3>
          <div className="max-h-56 overflow-y-auto pr-1">
            {brands.map(b=>(
              <label key={b} className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="checkbox" checked={selBrands.includes(b)} onChange={()=>setSelBrands(p=>p.includes(b)?p.filter(x=>x!==b):[...p,b])} className="w-4 h-4 rounded text-accent"/>
                <span className="text-sm dm-text-sec">{b}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button onClick={clear} className="w-full py-2 text-sm text-accent font-medium border border-accent rounded-xl hover:bg-accent/5 transition btn-press">Clear All Filters</button>
    </div>
  );
}
