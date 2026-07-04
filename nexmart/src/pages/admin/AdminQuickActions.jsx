import { Ic } from '../../components/icons';

export default function AdminQuickActions(){
  const actions=[
    {label:'Add Product', icon:<Ic.Plus s={18}/>,    cls:'bg-accent text-white hover:bg-accent/90'},
    {label:'Export CSV',  icon:<Ic.Download s={18}/>, cls:'bg-accent2 text-white hover:bg-accent2/90'},
    {label:'View Reports',icon:<Ic.FileText s={18}/>, cls:'dm-surface dm-text border dm-border hover:shadow-md'},
    {label:'Settings',    icon:<Ic.Settings s={18}/>, cls:'dm-surface dm-text border dm-border hover:shadow-md'},
  ];
  return(
    <div className="anim-fadeInUp" style={{animationDelay:'.35s',opacity:0,animationFillMode:'forwards'}}>
      <h3 className="font-semibold dm-text text-base mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((a,i)=>(
          <button key={i} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold btn-press transition-all ${a.cls}`}>
            {a.icon}{a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
