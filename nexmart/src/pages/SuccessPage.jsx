import { useState, useEffect, useContext } from 'react';
import { AppCtx } from '../context/AppContext';
import { getTier, formatPoints } from '../utils/loyalty';
import { nav } from '../utils/nav';
import Confetti from '../components/Confetti';

export default function SuccessPage(){
  const{addPoints,points}=useContext(AppCtx);
  const hash=window.location.hash;
  const params=new URLSearchParams(hash.split('?')[1]||'');
  const orderNum=params.get('order')||'NX-'+String(Math.floor(100000+Math.random()*900000));
  const emailAddr=decodeURIComponent(params.get('email')||'customer@example.com');
  const ptsEarned=parseInt(params.get('pts')||'0',10);

  const[showConfetti,setShowConfetti]=useState(true);
  const[displayPts,setDisplayPts]=useState(0);
  const[prevTier]=useState(()=>getTier(points));

  const delDate=new Date();delDate.setDate(delDate.getDate()+5);
  const delStr=delDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

  useEffect(()=>{
    if(ptsEarned>0){
      addPoints(ptsEarned);
      let cur=0;
      const step=Math.ceil(ptsEarned/40);
      const iv=setInterval(()=>{
        cur=Math.min(cur+step,ptsEarned);
        setDisplayPts(cur);
        if(cur>=ptsEarned)clearInterval(iv);
      },30);
      return()=>clearInterval(iv);
    }
  },[]);// eslint-disable-line

  useEffect(()=>{const t=setTimeout(()=>setShowConfetti(false),5500);return()=>clearTimeout(t)},[]);

  const newTier=getTier(points+(ptsEarned||0));
  const tierUpgrade=newTier.name!==prevTier.name;

  if(params.get('demo')==='1') return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center anim-fadeIn">
      <div className="text-5xl mb-5" aria-hidden="true">✓</div>
      <h1 className="font-heading text-3xl font-bold dm-text">Demo checkout complete</h1>
      <p className="mt-4 dm-text-sec leading-relaxed">You explored the full shopping flow. No payment was made, no real order was created, and no items will ship.</p>
      <p className="mt-5 text-sm dm-text-muted">Demo reference: {orderNum}</p>
      <a href="#/shop" className="inline-flex mt-8 px-7 py-3 bg-accent text-white font-semibold rounded-lg">Continue exploring ↗</a>
    </div>
  );

  return(
    <div className="max-w-2xl mx-auto px-4 py-16 text-center anim-fadeIn relative">

      {showConfetti&&<Confetti count={55}/>}

      {/* ═══ ANIMATED SVG CHECKMARK ═══ */}
      <div className="inline-block mb-6">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r="40" fill="none" stroke="#22C55E" strokeWidth="4" className="check-circle-anim"/>
          <path d="M27 45 L39 57 L63 33" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="check-mark-anim"/>
        </svg>
      </div>

      <h1 className="font-heading text-3xl lg:text-4xl font-bold dm-text">Order Confirmed! 🎉</h1>
      <p className="mt-3 dm-text-muted">Thank you for your purchase. Your order has been placed successfully.</p>

      {/* Points Earned Banner */}
      {ptsEarned>0&&(
        <div className="mt-6 dm-surface rounded-2xl p-5 border dm-border pts-earned-anim">
          {tierUpgrade&&<div className="reward-pop mb-3 text-3xl">{newTier.icon}</div>}
          <p className="text-sm dm-text-muted mb-1">{tierUpgrade?`🎊 Tier Up! You're now ${newTier.name}!`:'Points Earned'}</p>
          <p className="font-heading text-4xl font-black text-accent">+{formatPoints(displayPts)}</p>
          <p className="text-xs dm-text-muted mt-1">pts added to your rewards · <a href="#/rewards" className="text-accent font-semibold hover:underline">View Rewards →</a></p>
        </div>
      )}

      {/* Order Details Card */}
      <div className="mt-6 dm-surface rounded-2xl p-6 text-left space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm dm-text-muted">Order Number</span>
          <span className="font-mono font-bold text-accent text-lg">{orderNum}</span>
        </div>
        <hr className="dm-border"/>
        <div className="flex justify-between items-center">
          <span className="text-sm dm-text-muted">Confirmation Email</span>
          <span className="text-sm font-medium dm-text">{emailAddr}</span>
        </div>
        <hr className="dm-border"/>
        <div className="flex justify-between items-center">
          <span className="text-sm dm-text-muted">Estimated Delivery</span>
          <span className="text-sm font-medium dm-text">{delStr}</span>
        </div>
        <hr className="dm-border"/>
        <div className="flex justify-between items-center">
          <span className="text-sm dm-text-muted">Shipping Method</span>
          <span className="text-sm font-medium dm-text">Standard (3-5 days)</span>
        </div>
      </div>

      {/* What happens next */}
      <div className="mt-6 dm-card border dm-border rounded-2xl p-5 text-left">
        <h3 className="font-semibold text-sm dm-text mb-3">What happens next?</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0"><span className="text-green-600 text-xs font-bold">1</span></div>
            <div><p className="text-sm font-medium dm-text">Order Confirmed</p><p className="text-xs dm-text-muted">We've received your order and are processing it now.</p></div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><span className="text-blue-600 text-xs font-bold">2</span></div>
            <div><p className="text-sm font-medium dm-text">Preparing Shipment</p><p className="text-xs dm-text-muted">Your items will be carefully packed and shipped within 24 hours.</p></div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0"><span className="text-purple-600 text-xs font-bold">3</span></div>
            <div><p className="text-sm font-medium dm-text">Out for Delivery</p><p className="text-xs dm-text-muted">You'll receive tracking info via email once your order ships.</p></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={()=>nav('#/track')} className="px-7 py-3 border-2 dm-border dm-text font-semibold rounded-full hover:opacity-80 transition-all btn-press">
          Track Your Order
        </button>
        <a href="#/shop" className="px-7 py-3 bg-accent text-white font-semibold rounded-full hover:bg-accent/90 transition-all btn-press inline-block">
          Continue Shopping
        </a>
      </div>

      <p className="mt-6 text-xs dm-text-muted">Need help? Contact our support team at support@nexmart.com</p>
    </div>
  );
}
