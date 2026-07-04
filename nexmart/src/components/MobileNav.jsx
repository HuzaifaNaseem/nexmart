import { useState, useEffect } from 'react';
import { useStore } from '../context/AppContext';
import { Ic } from './icons';

export default function MobileNav(){
  const{st}=useStore();
  const[hash,setHash]=useState(window.location.hash||'#/');
  useEffect(()=>{const h=()=>setHash(window.location.hash||'#/');window.addEventListener('hashchange',h);return()=>window.removeEventListener('hashchange',h)},[]);
  const cc=st.cart.reduce((a,b)=>a+b.qty,0);
  return(
    <div className="lg:hidden fixed bottom-0 left-0 right-0 dm-card border-t dm-border z-50 px-2 py-1.5">
      <div className="flex items-center justify-around">
        {[{h:'#/',ic:<Ic.Home s={18}/>,l:'Home',a:hash==='#/'||hash===''},
          {h:'#/shop',ic:<Ic.Grid s={18}/>,l:'Shop',a:hash.startsWith('#/shop')},
          {h:'#/rewards',ic:<span className="text-lg leading-none">⭐</span>,l:'Rewards',a:hash==='#/rewards'},
          {h:'#/wishlist',ic:<Ic.Heart s={18}/>,l:'Wishlist',a:hash==='#/wishlist',b:st.wish.length},
          {h:'#/cart',ic:<Ic.Cart s={18}/>,l:'Cart',a:hash==='#/cart',b:cc}
        ].map(it=>(
          <a key={it.l} href={it.h} className={`flex flex-col items-center gap-0.5 py-1 px-3 relative ${it.a?'text-accent':'dm-text-muted'}`}>
            {it.ic}<span className="text-[10px] font-medium">{it.l}</span>
            {it.b>0&&<span className="absolute -top-0.5 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{it.b}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}
