import { useState, useEffect } from 'react';
import { Ic } from '../../components/icons';
import AdminSidebar from './AdminSidebar';
import StatCard from './StatCard';
import RevenueChart from './RevenueChart';
import TopProductsTable from './TopProductsTable';
import RecentOrdersTable from './RecentOrdersTable';
import AdminQuickActions from './AdminQuickActions';
import { getAdminStats, getRevenueChart, getRecentOrders, getTopProducts } from '../../api/admin';

export default function AdminPage(){
  const[activeSection,setActiveSection]=useState('dashboard');
  const[collapsed,setCollapsed]=useState(false);
  const[mobileSidebar,setMobileSidebar]=useState(false);
  const[stats,setStats]=useState(null);
  const[revenueData,setRevenueData]=useState(null);
  const[recentOrders,setRecentOrders]=useState(null);
  const[topProducts,setTopProducts]=useState(null);

  useEffect(()=>{
    Promise.all([getAdminStats(),getRevenueChart(30),getRecentOrders(10),getTopProducts(10)])
      .then(([s,rev,ord,prods])=>{setStats(s);setRevenueData(rev);setRecentOrders(ord);setTopProducts(prods);})
      .catch(()=>{});
  },[]);

  const fmtMoney=v=>'$'+(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  return(
    <div className="flex min-h-[calc(100vh-120px)]">
      <div className="hidden lg:flex">
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} collapsed={collapsed} setCollapsed={setCollapsed}/>
      </div>
      {mobileSidebar&&(
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setMobileSidebar(false)}/>
          <div className="absolute left-0 top-0 bottom-0" style={{animation:'slideInRight .3s ease-out'}}>
            <AdminSidebar activeSection={activeSection} setActiveSection={(s)=>{setActiveSection(s);setMobileSidebar(false);}} collapsed={false} setCollapsed={()=>{}}/>
          </div>
        </div>
      )}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="sticky top-0 z-10 dm-card border-b dm-border px-5 h-[65px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden dm-text btn-press" onClick={()=>setMobileSidebar(true)}><Ic.Menu s={22}/></button>
            <div>
              <h1 className="font-heading text-lg font-bold dm-text capitalize">{activeSection}</h1>
              <p className="text-[11px] dm-text-muted">{activeSection==='dashboard'?'Welcome back, Admin':`Manage ${activeSection}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Ic.Search s={14} c="absolute left-2.5 top-1/2 -translate-y-1/2 dm-text-muted"/>
              <input type="text" placeholder="Search..." className="pl-8 pr-3 py-1.5 dm-input border rounded-lg text-xs w-40 focus:outline-none focus:ring-2 focus:ring-accent/30"/>
            </div>
            <button className="relative p-2 rounded-lg dm-text-muted hover:dm-surface btn-press">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"/>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white text-[10px] font-bold shrink-0">AD</div>
          </div>
        </div>
        {activeSection==='dashboard'?(
          <div className="p-5 lg:p-7 space-y-6 max-w-[1400px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard icon={<Ic.Dollar s={20}/>} label="Total Revenue" value={stats?fmtMoney(stats.total_revenue):'—'} change="12%" changeDir="up" color="bg-green-100 text-green-600" delay={0}/>
              <StatCard icon={<Ic.Package s={20}/>} label="Orders Today" value={stats?String(stats.orders_today):'—'} change="8%" changeDir="up" color="bg-blue-100 text-blue-600" delay={0.06}/>
              <StatCard icon={<Ic.Users s={20}/>} label="Total Users" value={stats?stats.total_users.toLocaleString():'—'} change="23%" changeDir="up" color="bg-purple-100 text-purple-600" delay={0.12}/>
              <StatCard icon={<Ic.BarChart s={20}/>} label="Pending Orders" value={stats?String(stats.pending_orders):'—'} change="" changeDir="up" color="bg-orange-100 text-orange-600" delay={0.18}/>
            </div>
            <RevenueChart data={revenueData}/>
            <TopProductsTable products={topProducts}/>
            <RecentOrdersTable orders={recentOrders}/>
            <AdminQuickActions/>
          </div>
        ):(
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 dm-surface rounded-2xl flex items-center justify-center mb-4">
              {activeSection==='products'&&<Ic.ShoppingBag s={32}/>}
              {activeSection==='orders'&&<Ic.Package s={32}/>}
              {activeSection==='customers'&&<Ic.Users s={32}/>}
              {activeSection==='analytics'&&<Ic.PieChart s={32}/>}
              {activeSection==='settings'&&<Ic.Settings s={32}/>}
            </div>
            <h2 className="font-heading text-xl font-bold dm-text capitalize">{activeSection}</h2>
            <p className="dm-text-muted text-sm mt-1 max-w-xs">The {activeSection} management panel is under construction. Check back soon!</p>
            <button onClick={()=>setActiveSection('dashboard')} className="mt-4 px-5 py-2 bg-accent text-white text-sm font-semibold rounded-xl btn-press">← Back to Dashboard</button>
          </div>
        )}
      </main>
    </div>
  );
}
