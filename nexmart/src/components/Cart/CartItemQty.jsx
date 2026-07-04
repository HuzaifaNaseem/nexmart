import { useState } from 'react';
import { useStore } from '../../context/AppContext';
import { Ic } from '../icons';

export default function CartItemQty({idx,it,iconSize=12}){
  const{dp}=useStore();
  const[confirm,setConfirm]=useState(false);
  if(confirm)return(
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-red-500 font-medium">Remove?</span>
      <button onClick={()=>dp({type:'RM_CART',i:idx})} className="px-2 py-0.5 bg-red-500 text-white rounded-lg font-medium btn-press">Yes</button>
      <button onClick={()=>setConfirm(false)} className="px-2 py-0.5 border dm-border rounded-lg dm-text-muted btn-press">No</button>
    </div>
  );
  return(
    <div className="flex items-center gap-2">
      <div className="flex items-center border dm-border rounded-lg">
        <button onClick={()=>it.qty===1?setConfirm(true):dp({type:'UPD_QTY',i:idx,q:it.qty-1})} className="px-2 py-1 btn-press dm-text"><Ic.Minus s={iconSize}/></button>
        <span className="px-2 text-xs font-medium dm-text">{it.qty}</span>
        <button onClick={()=>dp({type:'UPD_QTY',i:idx,q:it.qty+1})} className="px-2 py-1 btn-press dm-text"><Ic.Plus s={iconSize}/></button>
      </div>
      <button onClick={()=>dp({type:'RM_CART',i:idx})} className="ml-auto dm-text-muted hover:text-red-500"><Ic.Trash s={iconSize}/></button>
    </div>
  );
}
