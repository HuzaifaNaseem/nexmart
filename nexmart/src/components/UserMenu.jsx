import { useState, useEffect, useRef, useContext } from 'react';
import { AppCtx } from '../context/AppContext';

const MENU_ITEMS = [
  { icon:'👤', label:'My Profile',  hash:'#/account' },
  { icon:'📦', label:'My Orders',   hash:'#/track'   },
  { icon:'⭐', label:'Rewards',     hash:'#/account' },
  { icon:'❤️', label:'Wishlist',    hash:'#/wishlist'},
];

export default function UserMenu() {
  const { user, setUser, setAuthModal } = useContext(AppCtx);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const signOut = () => {
    setUser(null);
    setOpen(false);
    window.location.hash = '#/';
  };

  if (!user) {
    return (
      <button
        onClick={() => setAuthModal('login')}
        className="dm-text hover:text-accent transition-colors btn-press p-1"
        aria-label="Sign In"
        title="Sign In"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <div
        className="user-avatar"
        style={{background: user.avatarColor || '#FF4D00'}}
        onClick={() => setOpen(o => !o)}
        title={user.name}
      >
        {user.initials}
      </div>

      {open && (
        <div className="user-dropdown dm-card border dm-border">
          <div className="px-5 py-4 border-b dm-border">
            <div className="flex items-center gap-3">
              <div className="user-avatar shrink-0" style={{background: user.avatarColor || '#FF4D00', width:40, height:40, fontSize:14}}>
                {user.initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold dm-text text-sm truncate">{user.name}</p>
                <p className="text-xs dm-text-muted truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="py-2">
            {MENU_ITEMS.map(item => (
              <div key={item.label} className="user-dropdown-item dm-text" onClick={() => { window.location.hash = item.hash; setOpen(false); }}>
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="h-px mx-3.5" style={{background:'var(--border-color)'}}/>

          <div className="py-2">
            <div className="user-dropdown-item" style={{color:'#ef4444'}} onClick={signOut}>
              <span>🚪</span>
              <span className="font-medium">Sign Out</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
