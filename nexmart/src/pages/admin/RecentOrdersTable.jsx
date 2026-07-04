import { useStore } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';

const FAKE_ORDERS=[
  {id:'NX-78234',customer:'Emma Wilson',    items:3,total:847.97,  status:'Delivered',  date:'Feb 26, 2026',avatar:'EW'},
  {id:'NX-78235',customer:'Liam Chen',      items:1,total:1299.99, status:'Shipped',    date:'Feb 25, 2026',avatar:'LC'},
  {id:'NX-78236',customer:'Sophia Martinez',items:2,total:489.98,  status:'Processing', date:'Feb 25, 2026',avatar:'SM'},
  {id:'NX-78237',customer:'Noah Johnson',   items:4,total:1122.96, status:'Delivered',  date:'Feb 24, 2026',avatar:'NJ'},
  {id:'NX-78238',customer:'Olivia Brown',   items:1,total:199.99,  status:'Shipped',    date:'Feb 24, 2026',avatar:'OB'},
  {id:'NX-78239',customer:'James Davis',    items:2,total:629.98,  status:'Processing', date:'Feb 23, 2026',avatar:'JD'},
  {id:'NX-78240',customer:'Ava Garcia',     items:3,total:431.97,  status:'Delivered',  date:'Feb 23, 2026',avatar:'AG'},
  {id:'NX-78241',customer:'William Lee',    items:1,total:749.99,  status:'Shipped',    date:'Feb 22, 2026',avatar:'WL'},
];

const STATUS_CLS={
  delivered:'bg-green-100 text-green-700',
  shipped:'bg-blue-100 text-blue-700',
  processing:'bg-yellow-100 text-yellow-700',
  pending:'bg-yellow-100 text-yellow-700',
  cancelled:'bg-red-100 text-red-700',
};

function adaptApiOrders(orders){
  return orders.map(o=>({
    id:'#'+o.id.slice(0,8).toUpperCase(),
    customer:o.user_name,
    items:o.item_count,
    total:o.total,
    status:o.status.charAt(0).toUpperCase()+o.status.slice(1),
    date:new Date(o.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
    avatar:o.user_name.split(' ').map(w=>w[0]||'').join('').slice(0,2).toUpperCase(),
  }));
}

export default function RecentOrdersTable({orders}){
  const{currency}=useStore();
  const displayOrders=orders?adaptApiOrders(orders):FAKE_ORDERS;
  const statusCls=o=>STATUS_CLS[o.status.toLowerCase()]||'bg-gray-100 text-gray-700';
  return(
    <div className="dm-card rounded-xl border dm-border overflow-hidden anim-fadeInUp" style={{animationDelay:'.3s',opacity:0,animationFillMode:'forwards'}}>
      <div className="p-5 border-b dm-border flex items-center justify-between">
        <div><h3 className="font-semibold dm-text text-base">Recent Orders</h3><p className="text-xs dm-text-muted mt-0.5">Latest {displayOrders.length} transactions</p></div>
        <button className="text-xs text-accent font-medium hover:underline">View All →</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="dm-surface text-left">
              <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Order ID</th>
              <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Items</th>
              <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Total</th>
              <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-semibold dm-text-muted uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y dm-border">
            {displayOrders.map(o=>(
              <tr key={o.id} className="admin-table-row">
                <td className="px-5 py-3 font-mono font-semibold dm-text text-xs">{o.id}</td>
                <td className="px-5 py-3"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{o.avatar}</div><span className="dm-text font-medium">{o.customer}</span></div></td>
                <td className="px-5 py-3 dm-text-sec">{o.items} {o.items===1?'item':'items'}</td>
                <td className="px-5 py-3 font-semibold dm-text">{formatPrice(o.total,currency)}</td>
                <td className="px-5 py-3"><span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusCls(o)}`}>{o.status}</span></td>
                <td className="px-5 py-3 dm-text-muted text-xs">{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
