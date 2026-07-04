export const TIERS = [
  { name:'Bronze',  min:0,     max:999,      color:'#CD7F32', cls:'tier-bronze', icon:'🥉', mult:1,   perks:['1x points on every purchase','Birthday bonus points','Member-only deals'] },
  { name:'Silver',  min:1000,  max:4999,     color:'#A8A8A8', cls:'tier-silver', icon:'🥈', mult:1.5, perks:['1.5x points on every purchase','Free standard shipping','Early sale access','Birthday 2x points'] },
  { name:'Gold',    min:5000,  max:9999,     color:'#FFD700', cls:'tier-gold',   icon:'🥇', mult:2,   perks:['2x points on every purchase','Free express shipping','Priority support','Exclusive deals','Birthday 3x points'] },
  { name:'Platinum',min:10000, max:Infinity, color:'#6495ED', cls:'tier-platinum',icon:'💎', mult:3,  perks:['3x points on every purchase','Free overnight shipping','Dedicated support','VIP early access','Birthday 5x points','Quarterly surprise gifts'] },
];

export const getTier = (pts) =>
  [...TIERS].reverse().find(t => pts >= t.min) || TIERS[0];

export const getNextTier = (pts) => {
  const idx = TIERS.findIndex(t => t.name === getTier(pts).name);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
};

export const getTierProgress = (pts) => {
  const tier = getTier(pts);
  const next = getNextTier(pts);
  if (!next) return 100;
  return Math.min(100, Math.round(((pts - tier.min) / (next.min - tier.min)) * 100));
};

export const getStoredPoints = () => {
  const v = localStorage.getItem('nexmart_points');
  return v !== null ? parseInt(v, 10) : 1250;
};

export const storePoints = (pts) =>
  localStorage.setItem('nexmart_points', String(pts));

export const formatPoints = (pts) =>
  pts.toLocaleString();

export const POINTS_PER_DOLLAR = 2;
export const CENTS_PER_POINT = 0.01; // 100pts = $1

export const getFakeTransactions = () => [
  { id:1, type:'earn',  label:'Purchase — Sony WH-1000XM5',   pts:450,   date:'Jan 20, 2025' },
  { id:2, type:'earn',  label:'Purchase — Nike Air Max 270',   pts:280,   date:'Jan 15, 2025' },
  { id:3, type:'spend', label:'Redeemed for $5 discount',      pts:-500,  date:'Jan 10, 2025' },
  { id:4, type:'earn',  label:'Birthday Bonus',                pts:200,   date:'Jan 5, 2025'  },
  { id:5, type:'earn',  label:'Referral Bonus',                pts:100,   date:'Dec 28, 2024' },
  { id:6, type:'earn',  label:'Purchase — Samsung Galaxy S25', pts:820,   date:'Dec 20, 2024' },
  { id:7, type:'spend', label:'Redeemed for $3 discount',      pts:-300,  date:'Dec 15, 2024' },
  { id:8, type:'earn',  label:'Purchase — MacBook Pro 14"',    pts:1200,  date:'Dec 10, 2024' },
];
