import { CATEGORIES, BRANDS, colorMap } from '../data/products';
import { useProducts } from '../hooks/useProducts';

const MIN_PRICE = 0;
const MAX_PRICE = 2000;

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
  const fillLeft  = ((priceRange[0]-MIN_PRICE)/(MAX_PRICE-MIN_PRICE))*100;
  const fillWidth = ((priceRange[1]-priceRange[0])/(MAX_PRICE-MIN_PRICE))*100;

  return(
    <div className="space-y-5">

      {/* Category */}
      <div>
        <h3 className="font-semibold text-sm mb-2 dm-text">Category</h3>
        {CATEGORIES.filter(c=>c!=='All').map(c=>(
          <label key={c} className="flex items-center gap-2 py-1 cursor-pointer">
            <input type="checkbox" checked={selCats.includes(c)} onChange={()=>setSelCats(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c])} className="w-4 h-4 rounded text-accent"/>
            <span className="text-sm dm-text-sec">{c}</span>
            <span className="ml-auto text-xs dm-text-muted">{PRODUCTS.filter(p=>p.category===c).length}</span>
          </label>
        ))}
      </div><hr className="dm-border"/>

      {/* Price Range (dual slider) */}
      <div>
        <h3 className="font-semibold text-sm mb-2 dm-text">Price Range</h3>
        <div className="flex justify-between text-xs dm-text-muted mb-2 font-semibold">
          <span>${priceRange[0]}</span><span>${priceRange[1].toLocaleString()}</span>
        </div>
        <div className="dual-range">
          <div className="range-track"/>
          <div className="range-track-fill" style={{left:`${fillLeft}%`,width:`${fillWidth}%`}}/>
          <input type="range" min={MIN_PRICE} max={MAX_PRICE} step={10} value={priceRange[0]}
            onChange={e=>setPriceRange([Math.min(+e.target.value,priceRange[1]-10),priceRange[1]])}/>
          <input type="range" min={MIN_PRICE} max={MAX_PRICE} step={10} value={priceRange[1]}
            onChange={e=>setPriceRange([priceRange[0],Math.max(+e.target.value,priceRange[0]+10)])}/>
        </div>
      </div><hr className="dm-border"/>

      {/* Color */}
      <div>
        <h3 className="font-semibold text-sm mb-2 dm-text">Color</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(colorMap).slice(0,15).map(([name,hex])=>{
            const isLight=['White','Starlight','Champagne','Cream Bouclé','Silver','Chrome','Cool Gray'].includes(name);
            return(
              <div key={name} title={name}
                className={`color-swatch ${isLight?'color-swatch-light':''} ${filterColor===name?'active':''}`}
                style={{backgroundColor:hex}}
                onClick={()=>setFilterColor(filterColor===name?null:name)}
              />
            );
          })}
        </div>
        {filterColor&&<p className="text-xs dm-text-muted mt-1.5">Color: <span className="font-semibold text-accent">{filterColor}</span></p>}
      </div><hr className="dm-border"/>

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
        <div className="flex items-center justify-between py-1">
          <span className="text-sm dm-text-sec">In Stock Only</span>
          <div className={`shop-toggle ${filterInStock?'active':''}`} onClick={()=>setFilterInStock(v=>!v)}/>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-sm dm-text-sec">On Sale Only</span>
          <div className={`shop-toggle ${filterOnSale?'active':''}`} onClick={()=>setFilterOnSale(v=>!v)}/>
        </div>
      </div><hr className="dm-border"/>

      {/* Brand */}
      <div>
        <h3 className="font-semibold text-sm mb-2 dm-text">Brand</h3>
        {BRANDS.map(b=>(
          <label key={b} className="flex items-center gap-2 py-1 cursor-pointer">
            <input type="checkbox" checked={selBrands.includes(b)} onChange={()=>setSelBrands(p=>p.includes(b)?p.filter(x=>x!==b):[...p,b])} className="w-4 h-4 rounded text-accent"/>
            <span className="text-sm dm-text-sec">{b}</span>
          </label>
        ))}
      </div>

      <button onClick={clear} className="w-full py-2 text-sm text-accent font-medium border border-accent rounded-xl hover:bg-accent/5 transition btn-press">Clear All Filters</button>
    </div>
  );
}
