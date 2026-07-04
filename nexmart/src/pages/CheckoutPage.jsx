import { useState, useContext } from 'react';
import { Fragment } from 'react';
import { useStore, AppCtx } from '../context/AppContext';
import { formatPrice } from '../utils/currency';
import { nav } from '../utils/nav';
import { saveLastOrder } from '../utils/orderStorage';
import { POINTS_PER_DOLLAR } from '../utils/loyalty';
import PointsUseSection from '../components/PointsUseSection';
import { checkout as apiCheckout } from '../api/orders';
import { clearCart as apiClearCart, addToCart as apiAddToCart } from '../api/cart';

export default function CheckoutPage(){
  const{st,dp,currency}=useStore();
  const{user,spendPoints}=useContext(AppCtx);
  const[step,setStep]=useState(1);
  const[sh,setSh]=useState({fn:'',ln:'',email:'',phone:'',addr1:'',addr2:'',city:'',state:'',zip:'',country:'US',del:'standard'});
  const[pay,setPay]=useState({method:'card',num:'',name:'',exp:'',cvv:''});
  const[errs,setErrs]=useState({});
  const[agreed,setAgreed]=useState(false);
  const[appliedPoints,setAppliedPoints]=useState(0);
  const[pointsDisc,setPointsDisc]=useState(0);

  const sub=st.cart.reduce((a,b)=>a+b.price*b.qty,0);
  const delFee=sh.del==='express'?12.99:sh.del==='overnight'?24.99:(sub>=50?0:9.99);
  const disc=st.promoDisc>0?sub*(st.promoDisc/100):0;
  const tax=(sub-disc-pointsDisc+delFee)*.08;const tot=sub-disc-pointsDisc+delFee+tax;

  if(!st.cart.length)return<div className="max-w-3xl mx-auto px-4 py-20 text-center anim-fadeIn"><span className="text-5xl">🛒</span><h2 className="mt-3 font-heading text-2xl font-bold">Cart is empty</h2><a href="#/shop" className="mt-3 inline-block text-accent font-medium">Continue Shopping</a></div>;

  const v1=()=>{const e={};if(!sh.fn.trim())e.fn='Required';if(!sh.ln.trim())e.ln='Required';if(!sh.email.includes('@'))e.email='Valid email required';if(!sh.phone.trim())e.phone='Required';if(!sh.addr1.trim())e.addr1='Required';if(!sh.city.trim())e.city='Required';if(!sh.state.trim())e.state='Required';if(!sh.zip.trim())e.zip='Required';setErrs(e);return!Object.keys(e).length};
  const v2=()=>{const e={};if(pay.method==='card'){if(pay.num.replace(/\s/g,'').length<16)e.num='Valid card number required';if(!pay.name.trim())e.name='Required';if(!pay.exp.match(/^\d{2}\/\d{2}$/))e.exp='MM/YY format';if(pay.cvv.length<3)e.cvv='Valid CVV required'}setErrs(e);return!Object.keys(e).length};

  const fmtCard=v=>{const c=v.replace(/\D/g,'').slice(0,16);return c.replace(/(\d{4})(?=\d)/g,'$1 ')};
  const fmtExp=v=>{const c=v.replace(/\D/g,'').slice(0,4);return c.length>=3?c.slice(0,2)+'/'+c.slice(2):c};
  const cardBrand=()=>{const n=pay.num.replace(/\s/g,'');return n.startsWith('4')?'Visa':n.startsWith('5')||n.startsWith('2')?'Mastercard':n.startsWith('3')?'Amex':'Card'};

  const placeOrder=async()=>{
    if(!agreed){dp({type:'NOTIFY',p:{tp:'error',msg:'⚠ Please agree to the terms'}});return}
    const ptsEarned=Math.floor(Math.max(0,tot)*POINTS_PER_DOLLAR);
    let orderId='NXM-'+String(Math.floor(1000+Math.random()*9000));
    if(user){
      try{
        // The UI cart lives client-side; the server checks its own cart at
        // checkout. Mirror the local cart to the server before placing the order.
        await apiClearCart().catch(()=>{});
        for(const it of st.cart){
          await apiAddToCart(it.pid,it.qty);
        }
        const shippingAddress={name:`${sh.fn} ${sh.ln}`.trim(),address_line1:sh.addr1,address_line2:sh.addr2||null,city:sh.city,state:sh.state,postal_code:sh.zip,country:sh.country,phone:sh.phone||null};
        const res=await apiCheckout(shippingAddress);
        orderId=res?.id||orderId;
      }catch(e){
        dp({type:'NOTIFY',p:{tp:'error',msg:'⚠ '+(e.message||'Order failed')}});return;
      }
    }
    saveLastOrder({orderId,items:st.cart.map(i=>({name:i.name,price:i.price,qty:i.qty,image:i.image,id:i.pid})),total:tot,date:new Date().toISOString()});
    if(appliedPoints>0)spendPoints(appliedPoints);
    dp({type:'CLEAR_CART'});
    nav('#/success?order='+orderId+'&email='+encodeURIComponent(sh.email)+'&pts='+ptsEarned);
  };

  const Inp=({label,val,onChange,err,ph='',type='text',req=true,cls=''})=>(
    <div className={cls}><label className="block text-sm font-medium dm-text-sec mb-1">{label}{req&&<span className="text-red-500">*</span>}</label>
    <input type={type} value={val} onChange={onChange} placeholder={ph} className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-all dm-input ${err?'border-red-400':'dm-border'}`}/>
    {err&&<p className="text-xs text-red-500 mt-0.5">{err}</p>}</div>
  );

  return(
    <div className="max-w-7xl mx-auto px-4 py-6 anim-fadeIn">
      <h1 className="font-heading text-2xl font-bold dm-text mb-6">Checkout</h1>

      {/* Progress bar */}
      <div className="flex items-center justify-center mb-8 max-w-md mx-auto">
        {[{n:1,l:'Shipping'},{n:2,l:'Payment'},{n:3,l:'Review'}].map((s,i)=>(
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
                <Inp label="First Name" val={sh.fn} err={errs.fn} ph="John" onChange={e=>setSh({...sh,fn:e.target.value})}/>
                <Inp label="Last Name" val={sh.ln} err={errs.ln} ph="Doe" onChange={e=>setSh({...sh,ln:e.target.value})}/>
                <Inp label="Email" type="email" val={sh.email} err={errs.email} ph="john@example.com" onChange={e=>setSh({...sh,email:e.target.value})} cls="col-span-2 sm:col-span-1"/>
                <Inp label="Phone" type="tel" val={sh.phone} err={errs.phone} ph="(555) 123-4567" onChange={e=>setSh({...sh,phone:e.target.value})} cls="col-span-2 sm:col-span-1"/>
                <Inp label="Address" val={sh.addr1} err={errs.addr1} ph="123 Main Street" onChange={e=>setSh({...sh,addr1:e.target.value})} cls="col-span-2"/>
                <Inp label="Address Line 2" val={sh.addr2} req={false} ph="Apt, Suite (optional)" onChange={e=>setSh({...sh,addr2:e.target.value})} cls="col-span-2"/>
                <Inp label="City" val={sh.city} err={errs.city} ph="New York" onChange={e=>setSh({...sh,city:e.target.value})}/>
                <div className="grid grid-cols-2 gap-3">
                  <Inp label="State" val={sh.state} err={errs.state} ph="NY" onChange={e=>setSh({...sh,state:e.target.value})}/>
                  <Inp label="ZIP" val={sh.zip} err={errs.zip} ph="10001" onChange={e=>setSh({...sh,zip:e.target.value})}/>
                </div>
              </div>

              <h3 className="font-semibold text-sm mt-6 mb-3 dm-text">Delivery Method</h3>
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
                className="mt-6 w-full py-3.5 bg-accent text-white font-semibold rounded-xl btn-press">Continue to Payment</button>
            </div>
          )}

          {/* ═══ STEP 2: PAYMENT ═══ */}
          {step===2&&(
            <div className="dm-card rounded-2xl border dm-border p-5 anim-fadeInUp">
              <h2 className="font-heading text-lg font-bold dm-text mb-5">Payment Method</h2>
              <div className="flex gap-2 mb-5 flex-wrap">
                {[{id:'card',l:'💳 Credit Card'},{id:'paypal',l:'🅿️ PayPal'},{id:'apple',l:'🍎 Apple Pay'},{id:'google',l:'🔵 Google Pay'}].map(m=>(
                  <button key={m.id} onClick={()=>setPay({...pay,method:m.id})} className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all btn-press ${pay.method===m.id?'border-accent bg-accent/5 text-accent':'dm-border dm-text-muted'}`}>{m.l}</button>
                ))}
              </div>

              {pay.method==='card'?(
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="text" value={pay.num} onChange={e=>setPay({...pay,num:fmtCard(e.target.value)})} placeholder="1234 5678 9012 3456"
                        className={`w-full px-3 py-2.5 border rounded-xl text-sm pr-20 dm-input ${errs.num?'border-red-400':'dm-border'}`}/>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold dm-text-muted">💳 {cardBrand()}</span>
                    </div>
                    {errs.num&&<p className="text-xs text-red-500 mt-0.5">{errs.num}</p>}
                  </div>
                  <Inp label="Cardholder Name" val={pay.name} err={errs.name} ph="John Doe" onChange={e=>setPay({...pay,name:e.target.value})}/>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium dm-text-sec mb-1">Expiry<span className="text-red-500">*</span></label>
                      <input type="text" value={pay.exp} onChange={e=>setPay({...pay,exp:fmtExp(e.target.value)})} placeholder="MM/YY" className={`w-full px-3 py-2.5 border rounded-xl text-sm dm-input ${errs.exp?'border-red-400':'dm-border'}`}/>
                      {errs.exp&&<p className="text-xs text-red-500 mt-0.5">{errs.exp}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium dm-text-sec mb-1">CVV<span className="text-red-500">*</span></label>
                      <input type="text" value={pay.cvv} maxLength={4} onChange={e=>setPay({...pay,cvv:e.target.value.replace(/\D/g,'').slice(0,4)})} placeholder="123" className={`w-full px-3 py-2.5 border rounded-xl text-sm dm-input ${errs.cvv?'border-red-400':'dm-border'}`}/>
                      {errs.cvv&&<p className="text-xs text-red-500 mt-0.5">{errs.cvv}</p>}
                    </div>
                  </div>
                </div>
              ):(
                <div className="text-center py-8 dm-surface rounded-xl"><p className="dm-text-muted text-sm">You will be redirected to {pay.method==='paypal'?'PayPal':pay.method==='apple'?'Apple Pay':'Google Pay'} to complete payment.</p></div>
              )}

              <div className="mt-5 p-3 dm-surface rounded-xl flex items-center gap-2 text-xs dm-text-muted"><span>🔒</span>256-bit SSL encryption · PCI DSS Compliant</div>
              <div className="mt-5 flex gap-3">
                <button onClick={()=>setStep(1)} className="flex-1 py-3 border-2 dm-border dm-text-sec font-semibold rounded-xl btn-press">Back</button>
                <button onClick={()=>{if(v2())setStep(3);else dp({type:'NOTIFY',p:{tp:'error',msg:'⚠ Please fill payment details'}})}} className="flex-1 py-3 bg-accent text-white font-semibold rounded-xl btn-press">Review Order</button>
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
                  <div className="flex items-center justify-between mb-1"><h3 className="font-semibold text-sm dm-text">Payment</h3><button onClick={()=>setStep(2)} className="text-accent text-xs font-medium hover:underline">Edit</button></div>
                  <p className="text-sm dm-text-muted">{pay.method==='card'?`💳 ${cardBrand()} ending in ${pay.num.slice(-4)}`:pay.method==='paypal'?'🅿️ PayPal':pay.method==='apple'?'🍎 Apple Pay':'🔵 Google Pay'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm dm-text mb-2">Items ({st.cart.reduce((a,b)=>a+b.qty,0)})</h3>
                  <div className="space-y-2">{st.cart.map((it,i)=>(
                    <div key={i} className="flex items-center gap-3"><img src={it.image} alt="" className="w-12 h-12 object-cover rounded-lg"/><div className="flex-1 min-w-0"><p className="text-sm font-medium dm-text truncate">{it.name}</p><p className="text-xs dm-text-muted">Qty: {it.qty}{it.color?` · ${it.color}`:''}</p></div><p className="text-sm font-semibold dm-text">{formatPrice(it.price*it.qty,currency)}</p></div>
                  ))}</div>
                </div>
              </div>
              <PointsUseSection onApply={(pts,disc)=>{setAppliedPoints(pts);setPointsDisc(disc);}}/>
              <label className="flex items-start gap-2.5 mt-5 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5 rounded text-accent"/>
                <span className="text-sm dm-text-muted">I agree to the Terms of Service and Privacy Policy.</span>
              </label>
              <div className="mt-5 flex gap-3">
                <button onClick={()=>setStep(2)} className="flex-1 py-3 border-2 dm-border dm-text-sec font-semibold rounded-xl btn-press">Back</button>
                <button onClick={placeOrder} className="flex-1 py-3.5 bg-green-600 text-white font-semibold rounded-xl btn-press shadow-lg shadow-green-600/25">🔒 Place Order · {formatPrice(tot,currency)}</button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="dm-card rounded-2xl border dm-border p-5 sticky top-[130px]">
            <h3 className="font-heading text-base font-bold dm-text mb-3">Order Summary</h3>
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
