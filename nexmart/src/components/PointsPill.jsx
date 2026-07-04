import { useContext } from 'react';
import { AppCtx } from '../context/AppContext';
import { getTier, formatPoints } from '../utils/loyalty';

export default function PointsPill(){
  const{points,user}=useContext(AppCtx);
  if(!user)return null;
  const tier=getTier(points);
  return(
    <a href="#/rewards" className="points-pill dm-surface border dm-border" title={`${formatPoints(points)} reward points`}>
      <span className="text-base leading-none">{tier.icon}</span>
      <span className="text-xs font-bold dm-text">{formatPoints(points)}</span>
      <span className="text-[10px] dm-text-muted hidden sm:block">pts</span>
    </a>
  );
}
