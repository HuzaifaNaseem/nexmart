import { useState, useEffect } from 'react';
import useAuthGate from './hooks/useAuthGate';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/admin/AdminPage';
import SearchPage from './pages/SearchPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import RewardsPage from './pages/RewardsPage';
import ComparePage from './pages/ComparePage';

function ProtectedCheckoutPage(){const ok=useAuthGate('#/checkout');if(!ok)return null;return<CheckoutPage/>;}
function ProtectedAccountPage(){const ok=useAuthGate('#/account');if(!ok)return null;return<AccountPage/>;}

export default function Router(){
  const[hash,setHash]=useState(window.location.hash||'#/');
  useEffect(()=>{const h=()=>setHash(window.location.hash||'#/');window.addEventListener('hashchange',h);return()=>window.removeEventListener('hashchange',h)},[]);
  useEffect(()=>{window.scrollTo({top:0,behavior:'smooth'})},[hash]);
  useEffect(()=>{
    const setDesc=(d)=>{let m=document.querySelector('meta[name="description"]');if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m);}m.content=d;};
    if(hash==='#/'||hash===''){document.title='NexMart — Good things, all in one place';setDesc('Discover a considered collection across technology, style, home and more.');}
    else if(hash.startsWith('#/shop')){document.title='Shop | NEXMART';setDesc('Explore products across technology, style, home and more.');}
    else if(hash.startsWith('#/product/')){document.title='Product | NEXMART';}
    else if(hash==='#/cart'){document.title='Your Cart | NEXMART';}
    else if(hash.startsWith('#/checkout')){document.title='Checkout | NEXMART';}
    else if(hash==='#/wishlist'){document.title='Wishlist | NEXMART';}
    else if(hash==='#/account'){document.title='My Account | NEXMART';}
    else if(hash==='#/rewards'){document.title='Rewards | NEXMART';setDesc('Earn points on every purchase and redeem for discounts.');}
    else if(hash==='#/compare'){document.title='Compare Products | NEXMART';}
    else if(hash.startsWith('#/search')){document.title='Search | NEXMART';}
    else if(hash.startsWith('#/track')||hash.startsWith('#/orders')){document.title='Order Tracking | NEXMART';}
    else{document.title='NEXMART — Premium Online Store';}
  },[hash]);

  if(hash==='#/'||hash==='')return<HomePage/>;
  if(hash.startsWith('#/search'))return<SearchPage/>;
  if(hash.startsWith('#/shop'))return<ShopPage/>;
  if(hash.startsWith('#/product/'))return<ProductPage/>;
  if(hash==='#/cart')return<CartPage/>;
  if(hash.startsWith('#/checkout'))return<ProtectedCheckoutPage/>;
  if(hash.startsWith('#/success'))return<SuccessPage/>;
  if(hash==='#/wishlist')return<WishlistPage/>;
  if(hash==='#/account')return<ProtectedAccountPage/>;
  if(hash==='#/admin')return<AdminPage/>;
  if(hash.startsWith('#/track')||hash.startsWith('#/orders'))return<OrderTrackingPage/>;
  if(hash==='#/rewards')return<RewardsPage/>;
  if(hash==='#/compare')return<ComparePage/>;
  return<HomePage/>;
}
