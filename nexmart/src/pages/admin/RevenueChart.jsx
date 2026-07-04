import { useState } from 'react';
import { Ic } from '../../components/icons';

const DAY_NAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const FALLBACK=[{label:'Mon',value:6200},{label:'Tue',value:4800},{label:'Wed',value:7100},{label:'Thu',value:5400},{label:'Fri',value:3800},{label:'Sat',value:8200},{label:'Sun',value:4900}];

export default function RevenueChart({data}){
  const chartData=data&&data.length>0
    ?data.slice(-7).map(pt=>({label:DAY_NAMES[new Date(pt.date+'T12:00:00').getDay()],value:pt.revenue}))
    :FALLBACK;
  const days=chartData.map(d=>d.label);
  const values=chartData.map(d=>d.value);
  const maxVal=Math.max(...values)||1;
  const[hovIdx,setHovIdx]=useState(null);
  return(
    <div className="dm-card rounded-xl border dm-border p-5 anim-fadeInUp" style={{animationDelay:'.15s',opacity:0,animationFillMode:'forwards'}}>
      <div className="flex items-center justify-between mb-5">
        <div><h3 className="font-semibold dm-text text-base">Revenue Overview</h3><p className="text-xs dm-text-muted mt-0.5">Last 7 days performance</p></div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full"><Ic.TrendUp s={12}/> +18.2%</span>
      </div>
      <div className="flex items-end justify-between gap-3 h-52 px-2">
        {values.map((v,i)=>{
          const hPct=(v/maxVal)*100;
          return(
            <div key={i} className="flex-1 flex flex-col items-center gap-2 relative" onMouseEnter={()=>setHovIdx(i)} onMouseLeave={()=>setHovIdx(null)}>
              {hovIdx===i&&<div className="absolute -top-10 dm-card border dm-border shadow-xl rounded-lg px-3 py-1.5 text-xs font-bold dm-text whitespace-nowrap z-10 anim-fadeIn">${v.toLocaleString()}</div>}
              <div className="w-full flex items-end justify-center" style={{height:'180px'}}>
                <div className="chart-bar w-full max-w-[44px]" style={{height:`${hPct}%`,background:hovIdx===i?'linear-gradient(to top,#e04400,#FF4D00)':'linear-gradient(to top,#FF4D00,#FF9966)',animationDelay:`${i*0.08}s`,opacity:hovIdx!==null&&hovIdx!==i?0.45:1}}/>
              </div>
              <span className="text-[11px] dm-text-muted font-medium">{days[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
