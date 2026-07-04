import { useStore } from '../context/AppContext';
import { formatPrice } from '../utils/currency';
import CartItemQty from '../components/Cart/CartItemQty';

export default function CartPage(){
  const{st,dp,currency}=useStore();
  const sub=st.cart.reduce((a,b)=>a+b.price*b.qty,0);const ship=sub>=50?0:9.99;const disc=st.promoDisc>0?sub*(st.promoDisc/100):0;const tax=(sub-disc+ship)*.08;const tot=sub-disc+ship+tax;
  if(!st.cart.length)return<div className="max-w-7xl mx-auto px-4 py-20 text-center anim-fadeIn"><span className="text-6xl">🛒</span><h2 className="mt-4 font-heading text-2xl font-bold">Your Cart is Empty</h2><a href="#/shop" className="mt-4 inline-block px-6 py-2.5 bg-accent text-white rounded-full btn-press">Shop Now</a></div>;
  return(
    <div className="max-w-7xl mx-auto px-4 py-6 anim-fadeIn">
      <h1 className="font-heading text-2xl font-bold dm-text mb-6">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {st.cart.map((it,idx)=>(
            <div key={idx} className="flex gap-4 p-4 dm-card rounded-xl border dm-border">
              <img src={it.image} alt="" className="w-20 h-20 object-cover rounded-xl"/>
              <div className="flex-1 min-w-0"><h3 className="font-semibold dm-text">{it.name}</h3><p className="text-xs dm-text-muted">{[it.color,it.size].filter(Boolean).join(' · ')}</p><p className="text-lg font-bold mt-1 dm-text">{formatPrice(it.price,currency)}</p></div>
              <div className="flex flex-col items-end justify-between gap-2">
                <p className="text-sm font-semibold dm-text">{formatPrice(it.price*it.qty,currency)}</p>
                <CartItemQty idx={idx} it={it} iconSize={14}/>
              </div>
            </div>
          ))}
        </div>
        <div className="dm-card rounded-xl border dm-border p-5 sticky top-[130px] h-fit">
          <h2 className="font-heading text-lg font-bold dm-text mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="dm-text-muted">Subtotal</span><span className="dm-text">{formatPrice(sub,currency)}</span></div>
            {disc>0&&<div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(disc,currency)}</span></div>}
            <div className="flex justify-between"><span className="dm-text-muted">Shipping</span><span className="dm-text">{ship===0?'FREE':formatPrice(ship,currency)}</span></div>
            <div className="flex justify-between"><span className="dm-text-muted">Tax (8%)</span><span className="dm-text">{formatPrice(tax,currency)}</span></div>
            <hr className="dm-border"/><div className="flex justify-between text-lg font-bold dm-text"><span>Total</span><span>{formatPrice(tot,currency)}</span></div>
          </div>
          <a href="#/checkout" className="block w-full mt-4 py-3 bg-accent text-white text-center font-semibold rounded-xl btn-press">Checkout</a>
        </div>
      </div>
    </div>
  );
}
