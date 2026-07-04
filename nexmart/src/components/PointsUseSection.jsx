import { useContext, useState } from 'react';
import { AppCtx } from '../context/AppContext';
import { getTier, formatPoints } from '../utils/loyalty';

// 100pts = $1 discount
const PER_DOLLAR = 100;

export default function PointsUseSection({onApply}){
  const{points,user}=useContext(AppCtx);
  if(!user||points<PER_DOLLAR)return null;

  const tier=getTier(points);
  const maxUsable=Math.floor(points/PER_DOLLAR)*PER_DOLLAR;
  const [used,setUsed]=useState(0);
  const discount=(used/PER_DOLLAR).toFixed(2);

  const handle=(v)=>{
    const n=parseInt(v,10);
    setUsed(n);
    onApply(n,parseFloat((n/PER_DOLLAR).toFixed(2)));
  };

  return(
    <div className={`pts-use-section mt-4 ${used>0?'active':''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{tier.icon}</span>
          <div>
            <p className="text-sm font-semibold dm-text">Use Reward Points</p>
            <p className="text-xs dm-text-muted">You have <span className="font-bold text-accent">{formatPoints(points)}</span> pts available</p>
          </div>
        </div>
        {used>0&&<span className="text-sm font-bold text-green-600">-${discount}</span>}
      </div>
      <input type="range" min={0} max={maxUsable} step={PER_DOLLAR} value={used}
        onChange={e=>handle(e.target.value)} className="pts-slider w-full"/>
      <div className="flex justify-between mt-1.5 text-xs dm-text-muted">
        <span>0 pts</span>
        <span className={used>0?'text-accent font-semibold':''}>
          {used>0?`${formatPoints(used)} pts (−$${discount})`:`${formatPoints(maxUsable)} pts max`}
        </span>
      </div>
      <p className="text-[11px] dm-text-muted mt-2">100 points = $1.00 off · remaining {formatPoints(points-used)} pts after order</p>
    </div>
  );
}
