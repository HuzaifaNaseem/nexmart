import { getLastOrder } from '../utils/orderStorage';

export default function AccountRecentOrders() {
  const lastOrder = getLastOrder();

  const fakeOrders = [
    { orderId:'NXM-2831', date:new Date(Date.now()-7*86400000).toISOString(), total:149.97, status:'Delivered', statusColor:'text-green-600 bg-green-100', itemCount:3 },
    { orderId:'NXM-2795', date:new Date(Date.now()-21*86400000).toISOString(), total:89.99, status:'Delivered', statusColor:'text-green-600 bg-green-100', itemCount:1 },
  ];

  const orders = [];

  if (lastOrder) {
    const hoursSince = (Date.now() - new Date(lastOrder.date).getTime()) / 3600000;
    let status, statusColor;
    if (hoursSince < 1) { status='Order Placed'; statusColor='text-blue-600 bg-blue-100'; }
    else if (hoursSince < 6) { status='Processing'; statusColor='text-yellow-600 bg-yellow-100'; }
    else if (hoursSince < 24) { status='Shipped'; statusColor='text-purple-600 bg-purple-100'; }
    else if (hoursSince < 48) { status='Out for Delivery'; statusColor='text-orange-600 bg-orange-100'; }
    else { status='Delivered'; statusColor='text-green-600 bg-green-100'; }

    orders.push({
      orderId: lastOrder.orderId,
      date: lastOrder.date,
      total: lastOrder.total || lastOrder.items?.reduce((s,i)=>s+(i.price*(i.qty||1)),0) || 0,
      status, statusColor,
      itemCount: lastOrder.items?.length || 0,
      items: lastOrder.items
    });
  }

  orders.push(...fakeOrders);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold dm-text">Recent Orders</h3>
        <a href="#/track" className="text-sm font-semibold text-accent hover:underline btn-press">Track Order →</a>
      </div>

      <div className="space-y-3">
        {orders.map((order, i) => (
          <div
            key={order.orderId}
            className="dm-card border dm-border rounded-xl p-4 hover:border-accent/30 transition-colors cursor-pointer anim-fadeInUp"
            style={{animationDelay:`${i*.08}s`,opacity:0,animationFillMode:'forwards'}}
            onClick={() => window.location.hash = '#/track'}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl dm-surface flex items-center justify-center text-lg">📦</div>
                <div>
                  <p className="text-sm font-bold dm-text">#{order.orderId}</p>
                  <p className="text-xs dm-text-muted">
                    {new Date(order.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    {' · '}{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${order.statusColor}`}>{order.status}</span>
                <p className="text-sm font-bold dm-text mt-1">${order.total.toFixed(2)}</p>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="flex gap-2 mt-3 pt-3 border-t dm-border">
                {order.items.slice(0,4).map((item,j) => (
                  <div key={j} className="w-10 h-10 rounded-lg overflow-hidden border dm-border shrink-0">
                    {item.image
                      ? <img src={item.image} alt="" className="w-full h-full object-cover"/>
                      : <div className="w-full h-full dm-surface flex items-center justify-center text-xs">📦</div>}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="w-10 h-10 rounded-lg dm-surface border dm-border flex items-center justify-center text-xs font-bold dm-text-muted">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
