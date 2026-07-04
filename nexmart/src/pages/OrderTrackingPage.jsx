import { useState, useEffect, useMemo } from 'react';
import { getLastOrder } from '../utils/orderStorage';
import useCountdown from '../hooks/useCountdown';

const STEPS = [
  { key:'placed',      label:'Order Placed',      icon:'📋', desc:'Your order has been confirmed' },
  { key:'process',     label:'Processing',         icon:'⚙️', desc:"We're preparing your items" },
  { key:'shipped',     label:'Shipped',            icon:'🚚', desc:'Package handed to carrier' },
  { key:'outdelivery', label:'Out for Delivery',   icon:'📍', desc:'Driver is on the way to you' },
  { key:'delivered',   label:'Delivered',          icon:'✅', desc:'Package delivered to your door' },
];

export default function OrderTrackingPage() {
  const lastOrder = getLastOrder();
  const [orderId, setOrderId] = useState(lastOrder ? (lastOrder.orderId || 'NXM-2847') : '');
  const [tracking, setTracking] = useState(!!lastOrder);
  const [animStep, setAnimStep] = useState(0);

  const currentStep = useMemo(() => {
    if (!lastOrder?.date) return 2;
    const hoursSince = (Date.now() - new Date(lastOrder.date).getTime()) / 3600000;
    if (hoursSince < 1) return 0;
    if (hoursSince < 6) return 1;
    if (hoursSince < 24) return 2;
    if (hoursSince < 48) return 3;
    return 4;
  }, [lastOrder]);

  const stepDates = useMemo(() => {
    const base = lastOrder?.date ? new Date(lastOrder.date) : new Date(Date.now() - 18*3600000);
    return STEPS.map((_, i) => {
      const d = new Date(base);
      if (i === 1) d.setHours(d.getHours() + 3);
      else if (i === 2) d.setHours(d.getHours() + 12);
      else if (i === 3) { d.setDate(d.getDate() + 1); d.setHours(8, 0, 0); }
      else if (i === 4) { d.setDate(d.getDate() + 2); d.setHours(14, 0, 0); }
      return d;
    });
  }, [lastOrder]);

  const estimatedDelivery = useMemo(() => {
    const d = new Date(stepDates[0]);
    d.setDate(d.getDate() + 4);
    d.setHours(18, 0, 0);
    return d;
  }, [stepDates]);

  const countdown = useCountdown(estimatedDelivery);

  useEffect(() => {
    if (!tracking) { setAnimStep(0); return; }
    setAnimStep(0);
    let s = 0;
    const iv = setInterval(() => {
      s++;
      if (s > currentStep) { clearInterval(iv); return; }
      setAnimStep(s);
    }, 400);
    return () => clearInterval(iv);
  }, [tracking, currentStep]);

  const progressPct = tracking ? `${(animStep / (STEPS.length - 1)) * 100}%` : '0%';

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderId.trim()) setTracking(true);
  };

  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10 anim-fadeInUp">
        <span className="text-5xl mb-4 block">📦</span>
        <h1 className="font-heading text-3xl font-bold dm-text">Track Your Order</h1>
        <p className="dm-text-muted mt-2">Enter your order ID to see real-time delivery status</p>
      </div>

      <form onSubmit={handleTrack} className="anim-fadeInUp" style={{animationDelay:'.1s',opacity:0,animationFillMode:'forwards'}}>
        <div className="flex gap-3 max-w-lg mx-auto mb-10">
          <div className="flex-1 relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 dm-text-muted">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01M10 8h.01"/>
            </svg>
            <input
              type="text" value={orderId}
              onChange={e => { setOrderId(e.target.value); setTracking(false); }}
              placeholder="e.g. NXM-2847"
              className="w-full pl-12 pr-4 py-3.5 dm-input border dm-border rounded-xl text-sm font-medium"
            />
          </div>
          <button
            type="submit" disabled={!orderId.trim()}
            className="px-8 py-3.5 bg-accent text-white font-bold rounded-xl text-sm btn-press hover:bg-accent/90 transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            Track Order
          </button>
        </div>
      </form>

      {tracking && (
        <div className="anim-fadeInUp" style={{animationDelay:'.15s',opacity:0,animationFillMode:'forwards'}}>
          <div className="dm-card border dm-border rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
              <div>
                <p className="text-sm dm-text-muted">Order</p>
                <p className="font-heading text-xl font-bold dm-text">#{orderId.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm dm-text-muted">Estimated Delivery</p>
                <p className="font-heading text-lg font-bold text-accent">
                  {estimatedDelivery.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
                </p>
              </div>
            </div>

            <div className="track-timeline mb-8">
              <div className="track-progress-bar" style={{width:progressPct}}/>
              {STEPS.map((step, i) => {
                const status = i < animStep ? 'done' : i === animStep && tracking ? 'active' : 'waiting';
                return (
                  <div key={step.key} className="track-step">
                    <div className={`track-dot ${status}`}>
                      {status === 'done' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <span>{step.icon}</span>
                      )}
                    </div>
                    <span className={`track-step-label ${status} dm-text`}>{step.label}</span>
                    <span className="track-step-date dm-text-muted">
                      {i <= currentStep
                        ? stepDates[i].toLocaleDateString('en-US',{month:'short',day:'numeric'})
                        : 'Pending'}
                    </span>
                    {i <= currentStep && (
                      <span className="track-step-date dm-text-muted">
                        {stepDates[i].toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="dm-surface rounded-xl p-4 text-center mb-6">
              <p className="text-sm dm-text-muted">Current Status</p>
              <p className="font-heading text-lg font-bold dm-text mt-1">
                {STEPS[currentStep].icon} {STEPS[currentStep].label}
              </p>
              <p className="text-sm dm-text-muted mt-1">{STEPS[currentStep].desc}</p>
            </div>

            {currentStep < 4 && (
              <div className="flex justify-center mb-6">
                <div className="countdown-chip dm-surface">
                  <span className="text-xs dm-text-muted mr-1">Arrives in</span>
                  {[{val:countdown.d,label:'Days'},{val:countdown.h,label:'Hrs'},{val:countdown.m,label:'Min'},{val:countdown.s,label:'Sec'}].map((c,i) => (
                    <>
                      {i > 0 && <span key={`sep${i}`} className="text-lg font-bold dm-text-muted mx-1">:</span>}
                      <div key={c.label} className="countdown-num">
                        <span className="dm-text">{String(c.val ?? 0).padStart(2,'0')}</span>
                        <span className="dm-text-muted">{c.label}</span>
                      </div>
                    </>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center py-4">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-full font-bold">
                  ✅ Delivered Successfully
                </span>
              </div>
            )}
          </div>

          <div className="carrier-card anim-fadeInUp" style={{animationDelay:'.3s',opacity:0,animationFillMode:'forwards'}}>
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl shrink-0">🚛</div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold dm-text">FedEx Express</p>
              <p className="text-sm dm-text-muted mt-0.5">
                Tracking Number: <span className="font-mono font-bold text-accent">FX847291044</span>
              </p>
              <p className="text-xs dm-text-muted mt-1">
                {currentStep >= 2 ? 'Last scanned: Regional sort facility, Memphis TN' : 'Awaiting pickup'}
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-semibold text-accent border-2 border-accent rounded-xl hover:bg-accent hover:text-white transition-colors btn-press shrink-0">
              View on FedEx
            </button>
          </div>

          {lastOrder?.items && lastOrder.items.length > 0 && (
            <div className="dm-card border dm-border rounded-2xl p-6 mt-6 anim-fadeInUp" style={{animationDelay:'.4s',opacity:0,animationFillMode:'forwards'}}>
              <h3 className="font-heading font-bold dm-text mb-4">Order Items</h3>
              <div className="space-y-3">
                {lastOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 dm-surface rounded-xl">
                    {item.image && <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0"/>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold dm-text truncate">{item.name || `Item ${i+1}`}</p>
                      <p className="text-xs dm-text-muted">Qty: {item.qty || 1}</p>
                    </div>
                    <span className="text-sm font-bold dm-text">${((item.price||0)*(item.qty||1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!tracking && (
        <div className="text-center mt-6 anim-fadeInUp" style={{animationDelay:'.2s',opacity:0,animationFillMode:'forwards'}}>
          <p className="text-sm dm-text-muted mb-3">Need help?</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a href="#/account" className="px-4 py-2 rounded-full dm-surface border dm-border text-sm font-medium dm-text-sec hover:text-accent transition-colors btn-press">
              📋 Order History
            </a>
            <button className="px-4 py-2 rounded-full dm-surface border dm-border text-sm font-medium dm-text-sec hover:text-accent transition-colors btn-press">
              💬 Contact Support
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
