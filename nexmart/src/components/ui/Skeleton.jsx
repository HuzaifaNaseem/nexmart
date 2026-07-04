import React from 'react';

export function SkeletonCard({index=0}){
  return(
    <div className="rounded-xl overflow-hidden border dm-border dm-card anim-fadeIn" style={{animationDelay:`${index*0.05}s`}}>
      <div className="aspect-square skeleton-shimmer"/>
      <div className="p-3 space-y-2.5">
        <div className="skeleton-shimmer h-3 w-16 rounded-full"/>
        <div className="skeleton-shimmer h-4 w-full rounded-full"/>
        <div className="skeleton-shimmer h-4 w-3/4 rounded-full"/>
        <div className="flex items-center gap-1 mt-1">
          {[...Array(5)].map((_,i)=><div key={i} className="skeleton-shimmer w-3.5 h-3.5 rounded-full"/>)}
          <div className="skeleton-shimmer h-3 w-10 ml-1 rounded-full"/>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="skeleton-shimmer h-5 w-20 rounded-full"/>
          <div className="skeleton-shimmer h-3.5 w-14 rounded-full"/>
        </div>
      </div>
    </div>
  );
}

export function SkeletonListCard({index=0}){
  return(
    <div className="flex gap-4 dm-card rounded-xl border dm-border p-3 anim-fadeIn" style={{animationDelay:`${index*0.04}s`}}>
      <div className="w-28 h-28 rounded-xl skeleton-shimmer shrink-0"/>
      <div className="flex-1 space-y-2.5 py-1">
        <div className="skeleton-shimmer h-3 w-16 rounded-full"/>
        <div className="skeleton-shimmer h-4 w-3/4 rounded-full"/>
        <div className="skeleton-shimmer h-3.5 w-full rounded-full"/>
        <div className="skeleton-shimmer h-3.5 w-2/3 rounded-full"/>
        <div className="flex gap-1 mt-1">
          {[...Array(5)].map((_,i)=><div key={i} className="skeleton-shimmer w-3 h-3 rounded-full"/>)}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="skeleton-shimmer h-5 w-16 rounded-full"/>
          <div className="skeleton-shimmer h-3.5 w-12 rounded-full"/>
        </div>
      </div>
    </div>
  );
}

export function SkeletonProductPage(){
  return(
    <div className="max-w-7xl mx-auto px-4 py-6 anim-fadeIn">
      <div className="flex items-center gap-2 mb-5">
        <div className="skeleton-shimmer h-4 w-12 rounded-full"/><div className="skeleton-shimmer h-4 w-4 rounded-full"/><div className="skeleton-shimmer h-4 w-20 rounded-full"/><div className="skeleton-shimmer h-4 w-4 rounded-full"/><div className="skeleton-shimmer h-4 w-40 rounded-full"/>
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square rounded-2xl skeleton-shimmer mb-3"/>
          <div className="flex gap-2">{[...Array(3)].map((_,i)=><div key={i} className="w-16 h-16 rounded-xl skeleton-shimmer"/>)}</div>
        </div>
        <div className="space-y-4">
          <div className="skeleton-shimmer h-4 w-24 rounded-full"/>
          <div className="skeleton-shimmer h-8 w-full rounded-lg"/>
          <div className="skeleton-shimmer h-8 w-3/4 rounded-lg"/>
          <div className="flex gap-1">{[...Array(5)].map((_,i)=><div key={i} className="skeleton-shimmer w-5 h-5 rounded-full"/>)}<div className="skeleton-shimmer h-4 w-20 ml-2 rounded-full"/></div>
          <div className="flex items-center gap-3"><div className="skeleton-shimmer h-9 w-28 rounded-lg"/><div className="skeleton-shimmer h-5 w-20 rounded-full"/><div className="skeleton-shimmer h-6 w-16 rounded-full"/></div>
          <div className="skeleton-shimmer h-4 w-full rounded-full"/><div className="skeleton-shimmer h-4 w-full rounded-full"/><div className="skeleton-shimmer h-4 w-2/3 rounded-full"/>
          <div className="space-y-2 mt-4"><div className="skeleton-shimmer h-4 w-20 rounded-full"/><div className="flex gap-2">{[...Array(4)].map((_,i)=><div key={i} className="w-8 h-8 rounded-full skeleton-shimmer"/>)}</div></div>
          <div className="space-y-2"><div className="skeleton-shimmer h-4 w-16 rounded-full"/><div className="flex gap-2">{[...Array(4)].map((_,i)=><div key={i} className="skeleton-shimmer w-12 h-9 rounded-lg"/>)}</div></div>
          <div className="space-y-2.5 mt-4"><div className="skeleton-shimmer h-14 w-full rounded-xl"/><div className="skeleton-shimmer h-12 w-full rounded-xl"/></div>
          <div className="skeleton-shimmer h-24 w-full rounded-xl mt-4"/>
        </div>
      </div>
    </div>
  );
}
