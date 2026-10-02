import { Ic } from '../../components/icons';
import { BrandMark } from '../../components/BrandLogo';

export default function AdminSidebar({activeSection,setActiveSection,collapsed,setCollapsed}){
  const navItems=[
    {key:'dashboard', label:'Dashboard', icon:<Ic.Home s={18}/>},
    {key:'products',  label:'Products',  icon:<Ic.ShoppingBag s={18}/>},
    {key:'orders',    label:'Orders',    icon:<Ic.Package s={18}/>},
    {key:'customers', label:'Customers', icon:<Ic.Users s={18}/>},
    {key:'analytics', label:'Analytics', icon:<Ic.PieChart s={18}/>},
    {key:'settings',  label:'Settings',  icon:<Ic.Settings s={18}/>},
  ];
  return(
    <aside className={`dm-card border-r dm-border shrink-0 flex flex-col transition-all duration-300 ${collapsed?'w-[68px]':'w-[240px]'}`}>
      <div className="p-4 flex items-center gap-3 border-b dm-border h-[65px]">
        <div className="w-9 h-9 flex items-center justify-center shrink-0">
          <BrandMark className="w-9 h-9" />
        </div>
        {!collapsed&&<div className="min-w-0"><p className="font-heading font-bold text-sm dm-text truncate">NEXMART</p><p className="text-[10px] dm-text-muted">Admin Panel</p></div>}
        <button onClick={()=>setCollapsed(!collapsed)} className="ml-auto dm-text-muted hover:dm-text btn-press shrink-0 hidden lg:block" title={collapsed?'Expand':'Collapse'}>
          {collapsed?<Ic.Arrow s={14}/>:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>}
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item=>(
          <button key={item.key} onClick={()=>setActiveSection(item.key)} className={`admin-sidebar-item w-full text-left ${activeSection===item.key?'active':'dm-text-sec'}`} title={collapsed?item.label:''}>
            <span className="shrink-0">{item.icon}</span>
            {!collapsed&&<span>{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t dm-border">
        <a href="#/" className="admin-sidebar-item w-full dm-text-muted hover:text-accent">
          <Ic.Home s={18}/>
          {!collapsed&&<span className="text-sm">Back to Store</span>}
        </a>
      </div>
    </aside>
  );
}
