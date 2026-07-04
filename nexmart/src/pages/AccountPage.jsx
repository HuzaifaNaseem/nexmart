import { useContext } from 'react';
import { AppCtx, useStore } from '../context/AppContext';
import AccountRecentOrders from '../components/AccountRecentOrders';
import { getTier, formatPoints } from '../utils/loyalty';

export default function AccountPage(){
  const{currency}=useStore();
  const{user,points}=useContext(AppCtx);
  const tier=getTier(points);
  const displayName=user?.name||'Guest User';
  const displayEmail=user?.email||'guest@nexmart.com';
  const displayInitials=user?.initials||'?';
  const displayColor=user?.avatarColor||'#FF4D00';
  const memberSince=user?.joinDate?new Date(user.joinDate).toLocaleDateString('en-US',{month:'long',year:'numeric'}):'January 2025';

  return(
    <div className="max-w-4xl mx-auto px-4 py-6 anim-fadeIn">
      <h1 className="font-heading text-2xl font-bold dm-text mb-6">My Account</h1>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="dm-card rounded-2xl border dm-border p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="user-avatar shrink-0" style={{background:displayColor,width:56,height:56,fontSize:18}}>{displayInitials}</div>
            <div><h2 className="font-semibold text-lg dm-text">{displayName}</h2><p className="text-sm dm-text-muted">{displayEmail}</p></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b dm-border"><span className="text-sm dm-text-muted">Member Since</span><span className="text-sm font-medium dm-text">{memberSince}</span></div>
            <div className="flex justify-between py-2 border-b dm-border"><span className="text-sm dm-text-muted">Total Orders</span><span className="text-sm font-medium dm-text">12</span></div>
            <div className="flex justify-between py-2"><span className="text-sm dm-text-muted">Reward Points</span><a href="#/rewards" className="text-sm font-medium text-accent hover:underline">{formatPoints(points)} pts {tier.icon}</a></div>
          </div>
        </div>
        <div className="dm-card rounded-2xl border dm-border p-5">
          <AccountRecentOrders/>
        </div>
        <div className="dm-card rounded-2xl border dm-border p-5">
          <h3 className="font-heading text-lg font-bold dm-text mb-3">Saved Address</h3>
          <div className="p-3 dm-surface rounded-xl">
            <p className="text-sm font-semibold dm-text">Home <span className="text-xs text-accent ml-1">Default</span></p>
            <p className="text-sm dm-text-muted mt-1">123 Main Street, Apt 4B</p>
            <p className="text-sm dm-text-muted">New York, NY 10001</p>
          </div>
        </div>
        <div className="dm-card rounded-2xl border dm-border p-5">
          <h3 className="font-heading text-lg font-bold dm-text mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[{h:'#/shop',ic:'🛍️',l:'Shop'},{h:'#/rewards',ic:'⭐',l:'Rewards'},{h:'#/wishlist',ic:'💝',l:'Wishlist'},{h:'#/cart',ic:'🛒',l:'Cart'}].map(a=>(
              <a key={a.l} href={a.h} className="p-3 dm-surface rounded-xl text-center hover:opacity-80 transition-opacity"><span className="text-xl">{a.ic}</span><p className="text-sm font-medium dm-text mt-0.5">{a.l}</p></a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
