import { useState, useEffect, useRef } from 'react';
import { Ic } from './icons';

export function getSaleTarget(){
  const key='nexmart_sale_target';
  const saved=localStorage.getItem(key);
  if(saved){const t=parseInt(saved);if(t>Date.now())return t;}
  const t=Date.now()+24*3600*1000;
  localStorage.setItem(key,String(t));
  return t;
}

export default function PurchaseTicker(){
  const ITEMS=[
    {city:'New York',name:'Sony WH-1000XM5 Headphones',img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=60&q=70'},
    {city:'Los Angeles',name:'Apple MacBook Air M3',img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=60&q=70'},
    {city:'Chicago',name:'Nike Air Max 270 React',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&q=70'},
    {city:'Houston',name:'Apple Watch Series 9',img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&q=70'},
    {city:'Seattle',name:'Lululemon Yoga Mat Pro',img:'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=60&q=70'},
    {city:'Miami',name:'Chanel N°5 Eau de Parfum',img:'https://images.unsplash.com/photo-1541643600914-78b084683702?w=60&q=70'},
  ];
  const[vis,setVis]=useState(false);
  const[idx,setIdx]=useState(0);
  const[out,setOut]=useState(false);
  const ctrl=useRef({i:0,dead:false});
  useEffect(()=>{
    const c=ctrl.current;
    let t1,t2,t3,t4;
    const cycle=()=>{
      if(c.dead)return;
      setIdx(c.i);setOut(false);setVis(true);
      t2=setTimeout(()=>{setOut(true);t3=setTimeout(()=>{setVis(false);setOut(false);c.i=(c.i+1)%ITEMS.length;t4=setTimeout(cycle,12000)},400)},4000);
    };
    t1=setTimeout(cycle,3000);
    return()=>{c.dead=true;[t1,t2,t3,t4].forEach(t=>clearTimeout(t))};
  },[]);
  if(!vis)return null;
  const item=ITEMS[idx];
  return(
    <div style={{animation:out?'slideOutDown .4s ease-in forwards':'slideInUp .4s ease-out forwards'}}
      className="fixed bottom-20 lg:bottom-4 left-4 z-50 flex items-center gap-3 dm-card border dm-border shadow-2xl rounded-2xl p-3 max-w-[280px]">
      <img src={item.img} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0"/>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] dm-text-muted leading-tight">🛒 Someone in <span className="font-semibold dm-text">{item.city}</span> just bought</p>
        <p className="text-xs font-semibold dm-text truncate mt-0.5">{item.name}</p>
        <p className="text-[10px] text-green-600 mt-0.5 font-medium">✓ Verified · just now</p>
      </div>
      <button onClick={()=>{setOut(true);setTimeout(()=>{setVis(false);setOut(false)},400)}} className="shrink-0 dm-text-muted hover:dm-text self-start -mt-0.5"><Ic.X s={13}/></button>
    </div>
  );
}
