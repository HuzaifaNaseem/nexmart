import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/AppContext';
import { Ic } from '../icons';
import { CATEGORIES } from '../../data/products';
import { CURRENCIES } from '../../utils/currency';
import { nav } from '../../utils/nav';
import PromoBanner from './PromoBanner';
import SearchDropdown from './SearchDropdown';
import NotificationCenter from '../NotificationCenter';
import UserMenu from '../UserMenu';
import PointsPill from '../PointsPill';
import MegaMenu from './MegaMenu';

export default function Header({onCartOpen}){
  const{st,currency,setCurrency,darkMode,setDarkMode}=useStore();
  const[scrolled,setScrolled]=useState(false);
  const[searchRaw,setSearchRaw]=useState('');  // immediate input value
  const[search,setSearch]=useState('');         // debounced — passed to SearchDropdown
  const[searchOpen,setSearchOpen]=useState(false);
  const[focusIdx,setFocusIdx]=useState(-1);
  const[mobMenu,setMobMenu]=useState(false);
  const searchRef=useRef();
  const debounceRef=useRef(null);
  const[hash,setHash]=useState(window.location.hash||'#/');

  useEffect(()=>{
    const s=()=>setScrolled(window.scrollY>10);
    const h=()=>setHash(window.location.hash||'#/');
    window.addEventListener('scroll',s);window.addEventListener('hashchange',h);
    return()=>{window.removeEventListener('scroll',s);window.removeEventListener('hashchange',h)};
  },[]);
  useEffect(()=>{const h=e=>{if(searchRef.current&&!searchRef.current.contains(e.target))setSearchOpen(false)};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)},[]);

  // Debounce search input (300ms) before passing to SearchDropdown
  useEffect(()=>{
    clearTimeout(debounceRef.current);
    debounceRef.current=setTimeout(()=>setSearch(searchRaw),300);
    return()=>clearTimeout(debounceRef.current);
  },[searchRaw]);

  const cc=st.cart.reduce((a,b)=>a+b.qty,0);
  const urlCat=hash.includes('category=')?decodeURIComponent(hash.split('category=')[1]?.split('&')[0]||''):'';

  const clearSearch=()=>{setSearchRaw('');setSearch('');setSearchOpen(false);};

  return(
    <>
      <PromoBanner/>
      <header className={`sticky top-0 z-50 dm-header transition-shadow duration-300 ${scrolled?'shadow-md':''}`} style={{borderBottom:'1px solid var(--border-color)'}}>
        <div className="max-w-7xl mx-auto px-4 h-[64px] flex items-center gap-3">
          <button className="lg:hidden btn-press dm-text -ml-2 p-2 flex items-center justify-center min-w-[44px] min-h-[44px]" onClick={()=>setMobMenu(!mobMenu)}
            aria-label="Open navigation menu"><Ic.Menu/></button>
          <a href="#/" className="flex items-center gap-2 shrink-0" aria-label="NEXMART home">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center"><span className="text-white font-heading font-bold text-base">N</span></div>
            <span className="font-heading font-bold text-lg dm-text hidden sm:block">NEXMART</span>
          </a>
          <div className="flex-1 max-w-xl mx-auto relative" ref={searchRef}>
            <div className="relative">
              <Ic.Search s={16} c="absolute left-3 top-1/2 -translate-y-1/2 dm-text-muted"/>
              <input type="text" placeholder="Search products, brands..."
                className="w-full pl-9 pr-10 py-2 dm-input border rounded-full text-sm"
                value={searchRaw}
                aria-label="Search products"
                onChange={e=>{setSearchRaw(e.target.value);setSearchOpen(true);setFocusIdx(-1)}}
                onFocus={()=>setSearchOpen(true)}/>
              {searchRaw&&<button onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 dm-text-muted hover:dm-text">
                <Ic.X s={14}/>
              </button>}
            </div>
            {searchOpen&&<SearchDropdown query={search} onClose={clearSearch} focusIdx={focusIdx} setFocusIdx={setFocusIdx}/>}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={()=>setDarkMode(!darkMode)} className="p-2 rounded-full hover:opacity-80 btn-press dm-text"
              aria-label={darkMode?'Switch to light mode':'Switch to dark mode'}>
              <span className="text-lg leading-none">{darkMode?'☀️':'🌙'}</span>
            </button>
            <button className="relative btn-press p-2 rounded-full hover:opacity-80 hidden sm:block dm-text"
              onClick={()=>nav('#/wishlist')}
              aria-label={`Wishlist${st.wish.length>0?`, ${st.wish.length} items`:''}`}>
              <Ic.Heart s={20}/>{st.wish.length>0&&<span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">{st.wish.length}</span>}
            </button>
            <button className="relative btn-press p-2 rounded-full hover:opacity-80 dm-text"
              onClick={onCartOpen}
              aria-label={`Shopping cart${cc>0?`, ${cc} items`:''}`}>
              <Ic.Cart s={20}/>{cc>0&&<span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center anim-scaleIn">{cc}</span>}
            </button>
            <div className="hidden sm:block"><PointsPill/></div>
            <div className="hidden sm:block"><NotificationCenter/></div>
            <div className="hidden sm:block"><UserMenu/></div>
          </div>
        </div>
        <div className="border-t dm-border hidden lg:block relative">
          <MegaMenu/>
        </div>
        {mobMenu&&<div className="lg:hidden fixed inset-0 top-[64px] dm-bg z-40 anim-fadeIn overflow-auto p-4">
          {CATEGORIES.map(c=><a key={c} href={c==='All'?'#/shop':`#/shop?category=${encodeURIComponent(c)}`} onClick={()=>setMobMenu(false)} className="block px-4 py-3 text-base font-medium dm-text-sec rounded-xl hover:opacity-80">{c}</a>)}
          <hr className="my-3 dm-border"/>
          <a href="#/wishlist" onClick={()=>setMobMenu(false)} className="block px-4 py-3 text-base font-medium dm-text-sec hover:opacity-80">♥ Wishlist</a>
          <a href="#/account" onClick={()=>setMobMenu(false)} className="block px-4 py-3 text-base font-medium dm-text-sec hover:opacity-80">👤 Account</a>
          <a href="#/admin" onClick={()=>setMobMenu(false)} className="block px-4 py-3 text-base font-medium dm-text-sec hover:opacity-80">🛠 Admin</a>
          <hr className="my-3 dm-border"/>
          <div className="px-4 py-2"><p className="text-xs dm-text-muted font-semibold uppercase tracking-wider mb-2">Currency</p><div className="flex flex-wrap gap-2">{Object.values(CURRENCIES).map(c=>(<button key={c.code} onClick={()=>{setCurrency(c.code);setMobMenu(false)}} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${currency===c.code?'border-accent text-accent bg-accent/5':'dm-border dm-text-sec'}`}>{c.flag} {c.code}</button>))}</div></div>
        </div>}
      </header>
    </>
  );
}
