import { useStore } from '../context/AppContext';
import { useProducts } from '../hooks/useProducts';

export default function CompareBar(){
  const{compareList,toggleCompare,clearCompare}=useStore();
  const PRODUCTS=useProducts();
  if(compareList.length===0)return null;
  const items=compareList.map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean);

  return(
    <div className="compare-bar">
      <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
        <span className="text-xs text-white/60 shrink-0 font-semibold uppercase tracking-wide">Compare ({items.length}/3)</span>
        <div className="flex gap-2 flex-1 flex-wrap">
          {items.map(p=>(
            <div key={p.id} className="compare-item-mini">
              <img src={p.image} alt={p.name}/>
              <span className="text-xs font-medium text-white truncate max-w-[100px]">{p.name}</span>
              <button onClick={()=>toggleCompare(p.id)} className="text-white/50 hover:text-white ml-1 shrink-0 text-base leading-none">×</button>
            </div>
          ))}
          {Array.from({length:3-items.length}).map((_,i)=>(
            <div key={i} className="compare-item-mini opacity-30" style={{border:'1.5px dashed rgba(255,255,255,.3)'}}>
              <span className="text-xs text-white/60">Empty slot</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={()=>{if(items.length>=2)window.location.hash='#/compare';}}
            disabled={items.length<2}
            className="px-4 py-1.5 bg-accent text-white text-sm font-bold rounded-lg btn-press disabled:opacity-40 disabled:cursor-not-allowed"
          >⚖️ Compare</button>
          <button onClick={clearCompare} className="text-xs text-white/50 hover:text-white font-medium">Clear</button>
        </div>
      </div>
    </div>
  );
}
