import { useState } from 'react';

export default function Footer(){
  const[ftEmail,setFtEmail]=useState('');
  const[ftDone,setFtDone]=useState(false);
  return(
    <footer className="bg-primary text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center"><span className="text-white font-heading font-bold">N</span></div><span className="font-heading font-bold text-lg">NEXMART</span></div>
            <p className="text-gray-400 text-sm leading-relaxed">Your premium destination for curated products across electronics, fashion, home, beauty, and sports.</p>
            <div className="flex gap-2 mt-3">{['📸','🐦','📘','🎬'].map((ic,i)=><span key={i} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-accent transition-colors text-sm">{ic}</span>)}</div>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">Customer Service</h4>
            <div className="space-y-1.5">{['Track Order','Returns & Exchanges','FAQ','Contact Us','Size Guide'].map(l=><a key={l} href="#/" className="block text-sm text-gray-400 hover:text-accent transition-colors">{l}</a>)}</div>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">Company</h4>
            <div className="space-y-1.5">{['About Us','Careers','Press','Affiliate Program','Sustainability'].map(l=><a key={l} href="#/" className="block text-sm text-gray-400 hover:text-accent transition-colors">{l}</a>)}</div>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">Stay Connected</h4>
            <p className="text-sm text-gray-400 mb-2">Get exclusive deals and updates.</p>
            {ftDone?(
              <p className="text-sm text-green-400 font-medium">✓ Subscribed! Thank you.</p>
            ):(
              <form onSubmit={e=>{e.preventDefault();if(ftEmail.includes('@'))setFtDone(true)}} className="flex">
                <input type="email" required placeholder="Your email" value={ftEmail} onChange={e=>setFtEmail(e.target.value)} className="flex-1 px-3 py-2 bg-white/10 rounded-l-lg text-sm text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:border-accent"/>
                <button type="submit" className="px-3 py-2 bg-accent text-white text-sm font-medium rounded-r-lg hover:bg-accent/90 btn-press">Join</button>
              </form>
            )}
          </div>
        </div>
        <hr className="border-white/10 my-6"/>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© 2025 NEXMART. All Rights Reserved.</p>
          <div className="flex items-center gap-3"><span className="text-xs text-gray-400">💳 Visa</span><span className="text-xs text-gray-400">💳 Mastercard</span><span className="text-xs text-gray-400">💳 Amex</span><span className="text-xs text-gray-400">🅿️ PayPal</span><span className="text-xs text-gray-400">🍎 Apple Pay</span></div>
          <div className="flex gap-3"><a href="#/" className="text-xs text-gray-500 hover:text-gray-300">Privacy</a><a href="#/" className="text-xs text-gray-500 hover:text-gray-300">Terms</a><a href="#/" className="text-xs text-gray-500 hover:text-gray-300">Cookies</a></div>
        </div>
      </div>
    </footer>
  );
}
