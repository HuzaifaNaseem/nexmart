import { useState, useMemo } from 'react';
import { Fragment } from 'react';
import { useStore } from '../context/AppContext';
import { formatPrice } from '../utils/currency';
import { nav } from '../utils/nav';
import { saveLastOrder } from '../utils/orderStorage';
import PointsUseSection from '../components/PointsUseSection';

/**
 * Defined at module scope on purpose. When this lived inside CheckoutPage it
 * was a brand-new component type on every render, so React unmounted and
 * remounted each input on every keystroke — the field lost focus and only the
 * first character of anything typed survived.
 */
let inpSeq=0;
const Inp=({label,val,onChange,err,ph='',type='text',req=true,cls='',autoComplete,inputMode})=>{
  const id=useMemo(()=>`chk-${++inpSeq}`,[]);
  const errId=`${id}-error`;
  return(
    <div className={cls}>
      <label htmlFor={id} className="block text-sm font-medium dm-text-sec mb-1">
        {label}{req&&<span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      <input id={id} type={type} value={val} onChange={onChange} placeholder={ph}
        required={req} autoComplete={autoComplete} inputMode={inputMode}
        aria-invalid={!!err} aria-describedby={err?errId:undefined}
        className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-all dm-input ${err?'border-red-400':'dm-border'}`}/>
      {err&&<p id={errId} className="text-xs text-red-500 mt-0.5">{err}</p>}
    </div>
  );
};

export default function CheckoutPage(){
  const{st,dp,currency}=useStore();
  const[step,setStep]=useState(1);
  const[sh,setSh]=useState({fn:'',ln:'',email:'',phone:'',addr1:'',addr2:'',city:'',state:'',zip:'',country:'US',del:'standard'});
  const[errs,setErrs]=useState({});
  const[agreed,setAgreed]=useState(false);
  const[pointsDisc,setPointsDisc]=useState(0);

  const sub=st.cart.reduce((a,b)=>a+b.price*b.qty,0);
  const delFee=sh.del==='express'?12.99:sh.del==='overnight'?24.99:(sub>=50?0:9.99);
  const disc=st.promoDisc>0?sub*(st.promoDisc/100):0;
  const tax=(sub-disc-pointsDisc+delFee)*.08;const tot=sub-disc-pointsDisc+delFee+tax;

  if(!st.cart.length)return<div className="max-w-3xl mx-auto px-4 py-20 text-center anim-fadeIn"><span className="text-5xl">🛒</span><h2 className="mt-3 font-heading text-2xl font-bold">Cart is empty</h2><a href="#/shop" className="mt-3 inline-block text-accent font-medium">Continue Shopping</a></div>;

  const v1=()=>{const e={};if(!sh.fn.trim())e.fn='Required';if(!sh.ln.trim())e.ln='Required';if(!sh.email.includes('@'))e.email='Valid email required';if(!sh.phone.trim())e.phone='Required';if(!sh.addr1.trim())e.addr1='Required';if(!sh.city.trim())e.city='Required';if(!sh.state.trim())e.state='Required';if(!sh.zip.trim())e.zip='Required';setErrs(e);return!Object.keys(e).length};
  const placeOrder=()=>{
    if(!agreed){dp({type:'NOTIFY',p:{tp:'error',msg:'Please acknowledge this is a demo checkout'}});return}
    const orderId='DEMO-'+String(Math.floor(100000+Math.random()*900000));
    saveLastOrder({orderId,items:st.cart.map(i=>({name:i.name,price:i.price,qty:i.qty,image:i.image,id:i.pid})),total:tot,date:new Date().toISOString()});
    dp({type:'CLEAR_CART'});
    nav('#/success?order='+orderId+'&demo=1');
  };


  return(
    <div className="max-w-7xl mx-auto px-4 py-6 anim-fadeIn">
      <h1 className="font-heading text-2xl font-bold dm-text mb-3">Checkout preview</h1><p className="mb-6 rounded-xl border dm-border dm-surface px-4 py-3 text-sm dm-text-sec">Portfolio demo only. No payment is collected and no real order is fulfilled.</p>

      {/* Progress bar */}
      <div className="flex items-center justify-center mb-8 max-w-md mx-auto">
        {[{n:1,l:'Shipping'},{n:2,l:'Demo'},{n:3,l:'Review'}].map((s,i)=>(
          <Fragment key={s.n}>
            {i>0&&<div className={`flex-1 h-0.5 mx-2 ${step>=s.n?'bg-accent':'dm-badge-muted'}`}/>}
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step>=s.n?'bg-accent text-white':'dm-badge-muted dm-text-muted'}`}>{step>s.n?'✓':s.n}</div>
              <span className={`text-sm font-medium hidden sm:block ${step>=s.n?'dm-text':'dm-text-muted'}`}>{s.l}</span>
            </div>
          </Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">

          {/* ═══ STEP 1: SHIPPING ═══ */}
          {step===1&&(
            <div className="dm-card rounded-2xl border dm-border p-5 anim-fadeInUp">
              <h2 className="font-heading text-lg font-bold dm-text mb-5">Shipping Information</h2>
              <div className="grid grid-cols-2 gap-3">
                <Inp label="First Name" autoComplete="given-name" val={sh.fn} err={errs.fn} ph="John" onChange={e=>setSh({...sh,fn:e.target.value})}/>
                <Inp label="Last Name" autoComplete="family-name" val={sh.ln} err={errs.ln} ph="Doe" onChange={e=>setSh({...sh,ln:e.target.value})}/>
                <Inp label="Email" type="email" autoComplete="email" inputMode="email" val={sh.email} err={errs.email} ph="john@example.com" onChange={e=>setSh({...sh,email:e.target.value})} cls="col-span-2 sm:col-span-1"/>
                <Inp label="Phone" type="tel" autoComplete="tel" inputMode="tel" val={sh.phone} err={errs.phone} ph="(555) 123-4567" onChange={e=>setSh({...sh,phone:e.target.value})} cls="col-span-2 sm:col-span-1"/>
                <Inp label="Address" autoComplete="address-line1" val={sh.addr1} err={errs.addr1} ph="123 Main Street" onChange={e=>setSh({...sh,addr1:e.target.value})} cls="col-span-2"/>
                <Inp label="Address Line 2" autoComplete="address-line2" val={sh.addr2} req={false} ph="Apt, Suite (optional)" onChange={e=>setSh({...sh,addr2:e.target.value})} cls="col-span-2"/>
                <Inp label="City" autoComplete="address-level2" val={sh.city} err={errs.city} ph="New York" onChange={e=>setSh({...sh,city:e.target.value})}/>
                <div className="grid grid-cols-2 gap-3">
                  <Inp label="State" autoComplete="address-level1" val={sh.state} err={errs.state} ph="NY" onChange={e=>setSh({...sh,state:e.target.value})}/>
                  <Inp label="ZIP" autoComplete="postal-code" inputMode="numeric" val={sh.zip} err={errs.zip} ph="10001" onChange={e=>setSh({...sh,zip:e.target.value})}/>
                </div>
              </div>

              <h3 className="font-semibold text-sm mt-6 mb-3 dm-text">Delivery preference preview</h3>
              <div className="space-y-2">
                {[{id:'standard',l:'Standard Delivery',t:'3-5 business days',p:sub>=50?'FREE':'$9.99'},{id:'express',l:'Express Delivery',t:'1-2 business days',p:'$12.99'},{id:'overnight',l:'Overnight',t:'Next business day',p:'$24.99'}].map(d=>(
                  <label key={d.id} className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${sh.del===d.id?'border-accent bg-accent/5':'dm-border hover:border-accent/50'}`}>
                    <input type="radio" name="del" checked={sh.del===d.id} onChange={()=>setSh({...sh,del:d.id})} className="w-4 h-4 text-accent"/>
                    <div className="flex-1"><p className="text-sm font-semibold dm-text">{d.l}</p><p className="text-xs dm-text-muted">{d.t}</p></div>
                    <span className={`text-sm font-bold ${d.p==='FREE'?'text-green-600':'dm-text'}`}>{d.p}</span>
                  </label>
                ))}
              </div>

              <button onClick={()=>{if(v1())setStep(2);else dp({type:'NOTIFY',p:{tp:'error',msg:'⚠ Please fill all required fields'}})}}
                className="mt-6 w-full py-3.5 bg-accent text-white font-semibold rounded-xl btn-press">Continue to demo review</button>
            </div>
          )}

          {/* STEP 2: Demo checkout — no payment details are collected. */}
          {step===2&&(
            <div className="dm-card rounded-2xl border dm-border p-6 anim-fadeInUp">
              <h2 className="font-heading text-lg font-bold dm-text mb-4">Demo checkout</h2>
              <p className="text-sm dm-text-sec leading-relaxed">This is a portfolio demonstration. No payment will be taken, no real order will be placed, and no items will be shipped. Please do not enter real payment details.</p>
              <div className="mt-6 flex gap-3">
                <button onClick={()=>setStep(1)} className="flex-1 py-3 border-2 dm-border dm-text-sec font-semibold rounded-xl btn-press">Back</button>
                <button onClick={()=>setStep(3)} className="flex-1 py-3 bg-accent text-white font-semibold rounded-xl btn-press">Review demo order</button>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: REVIEW & PLACE ORDER ═══ */}
          {step===3&&(
            <div className="dm-card rounded-2xl border dm-border p-5 anim-fadeInUp">
              <h2 className="font-heading text-lg font-bold dm-text mb-5">Review Your Order</h2>
              <div className="space-y-4">
                <div className="p-4 dm-surface rounded-xl">
                  <div className="flex items-center justify-between mb-1"><h3 className="font-semibold text-sm dm-text">Shipping Address</h3><button onClick={()=>setStep(1)} className="text-accent text-xs font-medium hover:underline">Edit</button></div>
                  <p className="text-sm dm-text-muted">{sh.fn} {sh.ln}</p><p className="text-sm dm-text-muted">{sh.addr1}{sh.addr2?', '+sh.addr2:''}</p><p className="text-sm dm-text-muted">{sh.city}, {sh.state} {sh.zip}</p><p className="text-sm dm-text-muted">{sh.email} · {sh.phone}</p>
                </div>
                <div className="p-4 dm-surface rounded-xl">
                  <div className="flex items-center justify-between mb-1"><h3 className="font-semibold text-sm dm-text">Payment status</h3><button onClick={()=>setStep(2)} className="text-accent text-xs font-medium hover:underline">Edit</button></div>
                  <p className="text-sm dm-text-muted">No payment collected — portfolio demo</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm dm-text mb-2">Items ({st.cart.reduce((a,b)=>a+b.qty,0)})</h3>
                  <div className="space-y-2">{st.cart.map((it,i)=>(
                    <div key={i} className="flex items-center gap-3"><img src={it.image} alt="" className="w-12 h-12 object-cover rounded-lg"/><div className="flex-1 min-w-0"><p className="text-sm font-medium dm-text truncate">{it.name}</p><p className="text-xs dm-text-muted">Qty: {it.qty}{it.color?` · ${it.color}`:''}</p></div><p className="text-sm font-semibold dm-text">{formatPrice(it.price*it.qty,currency)}</p></div>
                  ))}</div>
                </div>
              </div>
              <PointsUseSection onApply={(_,disc)=>setPointsDisc(disc)}/>
              <label className="flex items-start gap-2.5 mt-5 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5 rounded text-accent"/>
                <span className="text-sm dm-text-muted">I understand this is a demo checkout with no payment or fulfilment.</span>
              </label>
              <div className="mt-5 flex gap-3">
                <button onClick={()=>setStep(2)} className="flex-1 py-3 border-2 dm-border dm-text-sec font-semibold rounded-xl btn-press">Back</button>
                <button onClick={placeOrder} className="flex-1 py-3.5 bg-green-600 text-white font-semibold rounded-xl btn-press shadow-lg shadow-green-600/25">Finish demo · {formatPrice(tot,currency)}</button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="dm-card rounded-2xl border dm-border p-5 sticky top-[130px]">
            <h3 className="font-heading text-base font-bold dm-text mb-3">Estimated demo total</h3>
            <div className="space-y-2 mb-3 max-h-40 overflow-auto">{st.cart.map((it,i)=>(
              <div key={i} className="flex items-center gap-2"><div className="relative"><img src={it.image} alt="" className="w-10 h-10 object-cover rounded-lg"/><span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 text-white text-[9px] rounded-full flex items-center justify-center">{it.qty}</span></div><p className="flex-1 text-xs font-medium dm-text truncate">{it.name}</p><p className="text-xs font-semibold dm-text">{formatPrice(it.price*it.qty,currency)}</p></div>
            ))}</div>
            <hr className="dm-border my-3"/>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="dm-text-muted">Subtotal</span><span className="dm-text">{formatPrice(sub,currency)}</span></div>
              {disc>0&&<div className="flex justify-between text-green-600"><span>Promo Discount</span><span>-{formatPrice(disc,currency)}</span></div>}
              {pointsDisc>0&&<div className="flex justify-between text-green-600"><span>Points Discount</span><span>-${pointsDisc.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="dm-text-muted">Shipping</span><span className="dm-text">{delFee===0?'FREE':formatPrice(delFee,currency)}</span></div>
              <div className="flex justify-between"><span className="dm-text-muted">Tax (8%)</span><span className="dm-text">{formatPrice(tax,currency)}</span></div>
              <hr className="dm-border"/><div className="flex justify-between font-bold text-base dm-text"><span>Total</span><span>{formatPrice(tot,currency)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
