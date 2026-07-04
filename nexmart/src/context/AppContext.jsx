import { createContext, useContext, useReducer, useState, useEffect, useCallback } from 'react';
import { getStoredUser, storeUser } from '../utils/auth';
import { getStoredPoints, storePoints } from '../utils/loyalty';
import { getCart as fetchApiCart } from '../api/cart.js';
import { getWishlist as fetchApiWish } from '../api/wishlist.js';
import { logout as apiLogout } from '../api/auth.js';
import { setTokens, clearTokens, getToken } from '../api/client.js';

export const AppCtx = createContext();
export const useStore = () => useContext(AppCtx);

/* ── helpers ───────────────────────────────────────────────── */
const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e',
  '#f97316','#10b981','#06b6d4','#3b82f6',
];
function pickColor(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function makeInitials(first = '', last = '') {
  return ((first[0] || '') + (last[0] || '')).toUpperCase() || '??';
}

/* ── reducer (unchanged) ────────────────────────────────────── */
export function reducer(st, a) {
  switch(a.type){
    case 'ADD_CART':{
      const ex=st.cart.find(i=>i.pid===a.p.pid&&i.color===a.p.color&&i.size===a.p.size);
      if(ex) return{...st,cart:st.cart.map(i=>i===ex?{...i,qty:i.qty+(a.p.qty||1)}:i)};
      return{...st,cart:[...st.cart,{...a.p,qty:a.p.qty||1}]};
    }
    case 'RM_CART': return{...st,cart:st.cart.filter((_,i)=>i!==a.i)};
    case 'UPD_QTY': return{...st,cart:st.cart.map((it,i)=>i===a.i?{...it,qty:Math.max(1,a.q)}:it)};
    case 'CLEAR_CART': return{...st,cart:[],promo:null,promoDisc:0};
    case 'TOG_WISH':{const id=a.id;return{...st,wish:st.wish.includes(id)?st.wish.filter(w=>w!==id):[...st.wish,id]};}
    case 'NOTIFY': return{...st,notifs:[...st.notifs,{id:Date.now(),...a.p}]};
    case 'RM_NOTIF': return{...st,notifs:st.notifs.filter(n=>n.id!==a.id)};
    case 'PROMO': return{...st,promo:a.code,promoDisc:a.disc};
    case 'RM_PROMO': return{...st,promo:null,promoDisc:0};
    default: return st;
  }
}

export function AppProvider({children}){
  const savedCart=localStorage.getItem('nexmart_cart');
  const savedWish=localStorage.getItem('nexmart_wish');
  const savedPromoRaw=localStorage.getItem('nexmart_promo');
  const savedPromo=savedPromoRaw?JSON.parse(savedPromoRaw):null;
  const init={
    cart:savedCart?JSON.parse(savedCart):[],
    wish:savedWish?JSON.parse(savedWish):[],
    notifs:[],
    promo:savedPromo?savedPromo.code:null,
    promoDisc:savedPromo?savedPromo.disc:0
  };
  const[st,dp]=useReducer(reducer,init);
  const[darkMode,setDarkMode]=useState(()=>localStorage.getItem('nexmart_dark')==='true');
  const[currency,setCurrency]=useState(()=>localStorage.getItem('nexmart_currency')||'USD');
  const[user,setUser]=useState(()=>getStoredUser());
  const[authModal,setAuthModal]=useState(null);
  const[authRedirect,setAuthRedirect]=useState(null);
  const[points,setPoints]=useState(()=>getStoredPoints());
  const[pointsPanelOpen,setPointsPanelOpen]=useState(false);

  const addPoints=(amt)=>setPoints(p=>{const n=p+Math.abs(amt);storePoints(n);return n;});
  const spendPoints=(amt)=>setPoints(p=>{const n=Math.max(0,p-Math.abs(amt));storePoints(n);return n;});

  const[compareList,setCompareList]=useState([]);
  const toggleCompare=(id)=>setCompareList(prev=>{
    if(prev.includes(id))return prev.filter(x=>x!==id);
    if(prev.length>=3)return prev;
    return[...prev,id];
  });
  const clearCompare=()=>setCompareList([]);

  /* ── NEW: API auth + cart/wishlist state ──────────────────── */
  const [accessToken, setAccessToken] = useState(() => getToken());
  const [apiCart, setApiCart]         = useState(null);
  const [apiWishlist, setApiWishlist] = useState(null);

  /* ── persist existing state ───────────────────────────────── */
  useEffect(()=>{localStorage.setItem('nexmart_currency',currency)},[currency]);
  useEffect(()=>{storeUser(user)},[user]);
  useEffect(()=>{storePoints(points)},[points]);
  useEffect(()=>{localStorage.setItem('nexmart_cart',JSON.stringify(st.cart))},[st.cart]);
  useEffect(()=>{localStorage.setItem('nexmart_wish',JSON.stringify(st.wish))},[st.wish]);
  useEffect(()=>{
    if(st.promo) localStorage.setItem('nexmart_promo',JSON.stringify({code:st.promo,disc:st.promoDisc}));
    else localStorage.removeItem('nexmart_promo');
  },[st.promo,st.promoDisc]);
  useEffect(()=>{
    localStorage.setItem('nexmart_dark',String(darkMode));
    const el=document.getElementById('root');
    if(darkMode){el.classList.add('dark-mode');el.classList.add('theme-transition');}
    else{el.classList.remove('dark-mode');el.classList.add('theme-transition');}
  },[darkMode]);

  /* ── NEW: load server cart ────────────────────────────────── */
  const loadApiCart = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await fetchApiCart();
      setApiCart(data?.items ?? []);
    } catch (e) {
      console.warn('loadApiCart failed:', e.message);
    }
  }, []);

  /* ── NEW: load server wishlist ────────────────────────────── */
  const loadApiWishlist = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await fetchApiWish();
      setApiWishlist(data?.items ?? []);
    } catch (e) {
      console.warn('loadApiWishlist failed:', e.message);
    }
  }, []);

  /* ── NEW: loginUser(tokenRes, meRes) ──────────────────────── */
  const loginUser = useCallback(async (tokenRes, meRes) => {
    setTokens(tokenRes.access_token, tokenRes.refresh_token);
    setAccessToken(tokenRes.access_token);

    const newUser = {
      id:          meRes.id,
      name:        `${meRes.first_name} ${meRes.last_name}`.trim(),
      email:       meRes.email,
      firstName:   meRes.first_name,
      lastName:    meRes.last_name,
      initials:    makeInitials(meRes.first_name, meRes.last_name),
      avatarColor: pickColor(meRes.email),
      joinDate:    meRes.created_at,
    };
    setUser(newUser);
    storeUser(newUser);

    const newPoints = meRes.points_balance ?? 0;
    setPoints(newPoints);
    storePoints(newPoints);

    await Promise.all([loadApiCart(), loadApiWishlist()]);
  }, [loadApiCart, loadApiWishlist]);

  /* ── NEW: logoutUser ──────────────────────────────────────── */
  const logoutUser = useCallback(() => {
    apiLogout();
    setAccessToken(null);
    setUser(null);
    storeUser(null);
    setPoints(0);
    storePoints(0);
    setApiCart(null);
    setApiWishlist(null);
  }, []);

  /* ── NEW: auto-logout on 401 ──────────────────────────────── */
  useEffect(() => {
    const handler = () => logoutUser();
    window.addEventListener('nexmart:unauthorized', handler);
    return () => window.removeEventListener('nexmart:unauthorized', handler);
  }, [logoutUser]);

  /* ── NEW: hydrate cart/wishlist if token present on mount ─── */
  useEffect(() => {
    if (getToken()) {
      loadApiCart();
      loadApiWishlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return(
    <AppCtx.Provider value={{
      /* existing */
      st,dp,
      currency,setCurrency,
      darkMode,setDarkMode,
      user,setUser,
      authModal,setAuthModal,
      authRedirect,setAuthRedirect,
      points,setPoints,addPoints,spendPoints,
      pointsPanelOpen,setPointsPanelOpen,
      compareList,toggleCompare,clearCompare,
      /* new */
      accessToken,
      apiCart,     setApiCart,     loadApiCart,
      apiWishlist, setApiWishlist, loadApiWishlist,
      loginUser,   logoutUser,
    }}>
      {children}
    </AppCtx.Provider>
  );
}
