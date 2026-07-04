import { useEffect } from 'react';
import { useStore } from '../../context/AppContext';
import { Ic } from '../icons';

export default function Toasts(){
  const{st,dp}=useStore();
  useEffect(()=>{
    if(st.notifs.length){
      const n=st.notifs[st.notifs.length-1];
      const t=setTimeout(()=>dp({type:'RM_NOTIF',id:n.id}),4000);
      return()=>clearTimeout(t);
    }
  },[st.notifs]);
  return(
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-xs">
      {st.notifs.map(n=>(
        <div key={n.id} className="toast-enter dm-card rounded-xl shadow-2xl border dm-border p-3 flex items-start gap-2">
          <span className="text-lg shrink-0">{n.tp==='success'?'✅':n.tp==='error'?'❌':'ℹ️'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium dm-text">{n.msg}</p>
            <div className="mt-1.5 h-1 dm-badge-muted rounded-full overflow-hidden"><div className={`h-full rounded-full toast-progress ${n.tp==='success'?'bg-green-500':n.tp==='error'?'bg-red-500':'bg-blue-500'}`}/></div>
          </div>
          <button onClick={()=>dp({type:'RM_NOTIF',id:n.id})} className="dm-text-muted hover:opacity-70 shrink-0"><Ic.X s={14}/></button>
        </div>
      ))}
    </div>
  );
}
