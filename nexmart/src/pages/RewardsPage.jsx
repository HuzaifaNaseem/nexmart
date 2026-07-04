import { useContext } from 'react';
import { AppCtx } from '../context/AppContext';
import { TIERS, getTier, getNextTier, getTierProgress, formatPoints, getFakeTransactions } from '../utils/loyalty';
import CircularProgressRing from '../components/CircularProgressRing';

export default function RewardsPage(){
  const{points,user}=useContext(AppCtx);
  const tier=getTier(points);
  const next=getNextTier(points);
  const pct=getTierProgress(points);
  const txns=getFakeTransactions();

  return(
    <div className="max-w-4xl mx-auto px-4 py-6 anim-fadeIn">
      <h1 className="font-heading text-2xl font-bold dm-text mb-6">Rewards & Loyalty</h1>

      {/* ── Hero Banner ── */}
      <div className="rewards-hero mb-6">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <CircularProgressRing pct={pct} size={100} stroke={9} color="#fff" bg="rgba(255,255,255,.2)">
            <div className="text-center">
              <p className="text-xl leading-none font-black text-white">{pct}%</p>
            </div>
          </CircularProgressRing>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <span className="text-2xl">{tier.icon}</span>
              <span className="font-heading text-xl font-bold text-white">{tier.name} Member</span>
            </div>
            <p className="text-white/80 text-sm mb-3">
              {user?.name||'Guest'} · <span className="font-bold text-white">{formatPoints(points)} pts</span>
            </p>
            {next?(
              <div>
                <p className="text-white/70 text-xs mb-1.5">
                  {formatPoints(next.min - points)} pts to {next.name} {next.icon}
                </p>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2 transition-all duration-1000" style={{width:`${pct}%`}}/>
                </div>
              </div>
            ):(
              <p className="text-white/80 text-sm font-semibold">🏆 You've reached the highest tier!</p>
            )}
          </div>
          <div className="text-center shrink-0">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Earn Rate</p>
            <p className="text-3xl font-black text-white">{tier.mult}x</p>
            <p className="text-white/70 text-xs">points per $1</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">

        {/* ── Ways to Earn ── */}
        <div className="dm-card rounded-2xl border dm-border p-5">
          <h3 className="font-heading text-base font-bold dm-text mb-3">Ways to Earn</h3>
          <div className="space-y-2">
            {[
              {ic:'🛍️',l:'Shop & Earn',d:`${tier.mult*2} pts per $1 spent`,c:'text-green-600'},
              {ic:'🎂',l:'Birthday Bonus',d:'Double points on your birthday',c:'text-pink-500'},
              {ic:'👥',l:'Refer a Friend',d:'100 pts per successful referral',c:'text-blue-500'},
              {ic:'⭐',l:'Write a Review',d:'25 pts per approved review',c:'text-yellow-500'},
              {ic:'📱',l:'App Bonus',d:'50 pts for first app purchase',c:'text-purple-500'},
            ].map(e=>(
              <div key={e.l} className="earn-card dm-surface flex items-center gap-3">
                <span className="text-xl shrink-0">{e.ic}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold dm-text">{e.l}</p>
                  <p className={`text-xs ${e.c} font-medium`}>{e.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Redeem Options ── */}
        <div className="dm-card rounded-2xl border dm-border p-5">
          <h3 className="font-heading text-base font-bold dm-text mb-3">Redeem Points</h3>
          <div className="space-y-2">
            {[
              {ic:'💵',l:'Order Discount',d:'100 pts = $1 off at checkout',pts:100,avail:points>=100},
              {ic:'🚚',l:'Free Shipping',d:'500 pts = free standard shipping',pts:500,avail:points>=500},
              {ic:'🎁',l:'Mystery Gift',d:'2,000 pts = surprise gift box',pts:2000,avail:points>=2000},
              {ic:'👑',l:'VIP Experience',d:'5,000 pts = exclusive member event',pts:5000,avail:points>=5000},
            ].map(r=>(
              <div key={r.l} className={`redeem-card flex items-center gap-3 ${r.avail?'dm-surface cursor-pointer':'opacity-40 dm-surface'}`}>
                <span className="text-xl shrink-0">{r.ic}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold dm-text">{r.l}</p>
                  <p className="text-xs dm-text-muted">{r.d}</p>
                </div>
                {r.avail
                  ? <a href="#/checkout" className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full whitespace-nowrap">Redeem</a>
                  : <span className="text-xs dm-text-muted whitespace-nowrap">{formatPoints(r.pts)} pts</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* ── Tier Cards ── */}
        <div className="dm-card rounded-2xl border dm-border p-5 md:col-span-2">
          <h3 className="font-heading text-base font-bold dm-text mb-4">Membership Tiers</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {TIERS.map(t=>(
              <div key={t.name} className={`tier-card dm-surface ${t.name===tier.name?'active-tier':''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{t.icon}</span>
                  <span className={`tier-badge ${t.cls}`}>{t.name}</span>
                </div>
                <p className="text-xs dm-text-muted mb-2">
                  {t.max===Infinity?`${formatPoints(t.min)}+ pts`:`${formatPoints(t.min)}–${formatPoints(t.max)} pts`}
                </p>
                <ul className="space-y-1">
                  {t.perks.slice(0,3).map(p=>(
                    <li key={p} className="text-[11px] dm-text-muted flex items-start gap-1">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>{p}
                    </li>
                  ))}
                </ul>
                {t.name===tier.name&&<p className="text-[10px] text-accent font-bold mt-2 uppercase tracking-wide">Current Tier</p>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Transaction History ── */}
        <div className="dm-card rounded-2xl border dm-border p-5 md:col-span-2">
          <h3 className="font-heading text-base font-bold dm-text mb-3">Points History</h3>
          <div>
            {txns.map(t=>(
              <div key={t.id} className="txn-item">
                <div className={t.type==='earn'?'txn-dot-earn':'txn-dot-spend'}>
                  {t.type==='earn'?'+':'−'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dm-text truncate">{t.label}</p>
                  <p className="text-xs dm-text-muted">{t.date}</p>
                </div>
                <span className={`text-sm font-bold ${t.type==='earn'?'text-green-600':'text-red-500'}`}>
                  {t.pts>0?'+':''}{formatPoints(t.pts)} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
