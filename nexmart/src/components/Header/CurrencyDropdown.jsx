import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/AppContext';
import { Ic } from '../icons';
import { CURRENCIES } from '../../utils/currency';

export default function CurrencyDropdown(){
  const{currency,setCurrency}=useStore();
  const[open,setOpen]=useState(false);
  const ref=useRef();
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)},[]);
  const cur=CURRENCIES[currency];
  return(
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(!open)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg dm-text-sec hover:dm-text text-xs font-semibold btn-press border dm-border">
        <span>{cur.flag}</span><span>{cur.symbol} {cur.code}</span><Ic.ChevDown s={11}/>
      </button>
      {open&&(
        <div className="absolute right-0 top-full mt-1.5 dm-card border dm-border rounded-xl shadow-xl z-[60] py-1 min-w-[130px] anim-fadeIn">
          {Object.values(CURRENCIES).map(c=>(
            <button key={c.code} onClick={()=>{setCurrency(c.code);setOpen(false)}}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:dm-surface ${currency===c.code?'text-accent font-bold':'dm-text-sec'}`}>
              <span>{c.flag}</span><span>{c.symbol} {c.code}</span>
              {currency===c.code&&<span className="ml-auto text-accent">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
