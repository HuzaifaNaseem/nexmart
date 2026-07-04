export const CURRENCIES={
  USD:{symbol:'$', code:'USD',rate:1,    flag:'🇺🇸'},
  EUR:{symbol:'€', code:'EUR',rate:0.92, flag:'🇪🇺'},
  GBP:{symbol:'£', code:'GBP',rate:0.79, flag:'🇬🇧'},
  INR:{symbol:'₹', code:'INR',rate:83.12,flag:'🇮🇳'},
  CAD:{symbol:'C$',code:'CAD',rate:1.36, flag:'🇨🇦'},
};

export const formatPrice=(usdPrice,cur='USD')=>{
  const c=CURRENCIES[cur]||CURRENCIES.USD;
  const v=usdPrice*c.rate;
  return cur==='INR'?`${c.symbol}${Math.round(v).toLocaleString('en-IN')}`:`${c.symbol}${v.toFixed(2)}`;
};
