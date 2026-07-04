import { useState } from 'react';
import { useStore } from '../../context/AppContext';
import { Ic } from '../icons';
import { formatPrice } from '../../utils/currency';
import CartItemQty from './CartItemQty';

export default function CartDrawer({open,onClose}){
  const{st,dp,currency}=useStore();
  const[promo,setPromo]=useState('');
  if(!open)return null;
  const sub=st.cart.reduce((a,b)=>a+b.price*b.qty,0);
  const ship=sub>=50?0:9.99;
  const disc=st.promoDisc>0?sub*(st.promoDisc/100):0;
  const tax=(sub-disc+ship)*.08;
  const tot=sub-disc+ship+tax;

  return(
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm dm-drawer shadow-2xl flex flex-col" style={{animation:'slideInRight .35s ease-out'}}>
        <div className="flex items-center justify-between p-5 border-b dm-border"><h2 className="font-heading text-lg font-bold dm-text">Cart ({st.cart.reduce((a,b)=>a+b.qty,0)})</h2><button onClick={onClose} className="dm-text"><Ic.X s={20}/></button></div>
        {st.cart.length===0?(
          <div className="flex-1 flex flex-col items-center justify-center p-5 text-center"><span className="text-5xl mb-3">🛒</span><h3 className="font-heading text-lg font-bold dm-text">Cart is empty</h3><p className="text-sm dm-text-muted mt-1">Add some items to get started.</p><button onClick={onClose} className="mt-4 px-5 py-2 bg-accent text-white rounded-full text-sm btn-press">Shop Now</button></div>
        ):(
          <>
            <div className="flex-1 overflow-auto p-5 space-y-3">
              {st.cart.map((it,idx)=>(
                <div key={idx} className="flex gap-3 pb-3 border-b dm-border last:border-0">
                  <a href={`#/product/${it.pid}`} onClick={onClose}><img src={it.image} alt="" className="w-16 h-16 object-cover rounded-xl"/></a>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold dm-text truncate">{it.name}</h4>
                    <p className="text-[11px] dm-text-muted">{[it.color,it.size].filter(Boolean).join(' · ')}</p>
                    <p className="text-sm font-bold mt-0.5 dm-text">{formatPrice(it.price,currency)}</p>
                    <div className="mt-1.5"><CartItemQty idx={idx} it={it} iconSize={12}/></div>
                    <p className="text-[10px] text-green-600 mt-1 font-medium">✓ {it.pid*3+5} others have this in their cart</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t dm-border p-5 space-y-2.5">
              <div className="flex gap-2"><input type="text" placeholder="Promo code" value={promo} onChange={e=>setPromo(e.target.value)} className="flex-1 px-3 py-2 border dm-border rounded-lg text-sm dm-input"/><button onClick={()=>{if(promo.toUpperCase()==='SAVE10'){dp({type:'PROMO',code:'SAVE10',disc:10});dp({type:'NOTIFY',p:{tp:'success',msg:'🎉 SAVE10 applied — 10% off!'}})}else dp({type:'NOTIFY',p:{tp:'error',msg:'Invalid promo code'}})}} className="px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg btn-press">Apply</button></div>
              {st.promo&&<div className="flex items-center justify-between text-sm"><span className="text-green-600 font-medium">🎉 {st.promo} applied</span><button onClick={()=>dp({type:'RM_PROMO'})} className="text-xs dm-text-muted hover:text-red-500">Remove</button></div>}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="dm-text-muted">Subtotal</span><span className="dm-text">{formatPrice(sub,currency)}</span></div>
                {disc>0&&<div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(disc,currency)}</span></div>}
                <div className="flex justify-between"><span className="dm-text-muted">Shipping</span><span className="dm-text">{ship===0?'FREE':formatPrice(ship,currency)}</span></div>
                <div className="flex justify-between"><span className="dm-text-muted">Tax (8%)</span><span className="dm-text">{formatPrice(tax,currency)}</span></div>
                <hr className="dm-border"/><div className="flex justify-between text-lg font-bold dm-text"><span>Total</span><span>{formatPrice(tot,currency)}</span></div>
              </div>
              <a href="#/checkout" onClick={onClose} className="block w-full py-3 bg-accent text-white text-center font-semibold rounded-xl btn-press">Checkout</a>
              <button onClick={onClose} className="w-full py-1.5 text-sm dm-text-muted">Continue Shopping</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
