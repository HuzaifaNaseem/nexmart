export default function CircularProgressRing({pct=0,size=90,stroke=10,color='#fff',bg='rgba(255,255,255,.2)',children}){
  const r=Math.round((size-stroke)/2);
  const circ=Math.round(2*Math.PI*r);
  const offset=Math.round(circ*(1-pct/100));
  return(
    <div style={{position:'relative',width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} className="ring-svg">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          style={{strokeDashoffset:offset,'--ring-offset':offset,transition:'stroke-dashoffset 1.2s ease'}}
        />
      </svg>
      {children&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>{children}</div>}
    </div>
  );
}
