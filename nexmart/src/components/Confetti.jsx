import { useState, useEffect } from 'react';

const COLORS=['#FF4D00','#6366F1','#FACC15','#22C55E','#EC4899','#3B82F6','#F97316','#8B5CF6','#EF4444','#14B8A6'];

export default function Confetti({count=60,duration=5000,onDone}){
  const[alive,setAlive]=useState(true);
  useEffect(()=>{
    const t=setTimeout(()=>{setAlive(false);onDone&&onDone();},duration);
    return()=>clearTimeout(t);
  },[duration,onDone]);
  if(!alive)return null;
  return(
    <>
      {Array.from({length:count}).map((_,i)=>(
        <div key={i} className="confetti-piece" style={{
          left:`${Math.random()*100}%`,
          backgroundColor:COLORS[Math.floor(Math.random()*COLORS.length)],
          width:`${6+Math.random()*10}px`,
          height:`${6+Math.random()*10}px`,
          borderRadius:Math.random()>.5?'50%':Math.random()>.5?'3px':'0',
          animationDuration:`${2+Math.random()*3}s`,
          animationDelay:`${Math.random()*1.5}s`,
          opacity:.9
        }}/>
      ))}
    </>
  );
}
