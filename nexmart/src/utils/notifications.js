export function buildNotifications() {
  const now = Date.now();
  const h = 3600000;
  return [
    { id:'n1', type:'order', icon:'📦', iconBg:'bg-blue-100', iconColor:'text-blue-600', title:'Your order has shipped!', body:'Order #NXM-2847 is on its way via FedEx.', time:now - 2*h, link:'#/track' },
    { id:'n2', type:'deal', icon:'🔥', iconBg:'bg-red-100', iconColor:'text-red-600', title:'Flash Sale: 40% off Electronics', body:"Limited time deal ending tonight. Don't miss out!", time:now - 5*h, link:'#/shop?category=Electronics' },
    { id:'n3', type:'reward', icon:'⭐', iconBg:'bg-yellow-100', iconColor:'text-yellow-700', title:'You earned 150 reward points!', body:'Your recent purchase earned bonus points.', time:now - 18*h, link:'#/account' },
    { id:'n4', type:'stock', icon:'🔔', iconBg:'bg-green-100', iconColor:'text-green-600', title:'Back in Stock: Sony WH-1000XM5', body:'An item on your watchlist is available again!', time:now - 26*h, link:'#/product/1' },
    { id:'n5', type:'order', icon:'📦', iconBg:'bg-blue-100', iconColor:'text-blue-600', title:'Order delivered!', body:'Order #NXM-2831 was delivered to your door.', time:now - 72*h, link:'#/track' },
    { id:'n6', type:'deal', icon:'🔥', iconBg:'bg-red-100', iconColor:'text-red-600', title:'Weekend Special: Free Shipping', body:'All orders over $50 ship free this weekend.', time:now - 120*h, link:'#/' },
  ];
}

export function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function groupNotifications(notifs) {
  const today = new Date(); today.setHours(0,0,0,0);
  const todayTs = today.getTime();
  const weekTs = todayTs - 6*86400000;
  const groups = { 'Today':[], 'This Week':[], 'Earlier':[] };
  notifs.forEach(n => {
    if (n.time >= todayTs) groups['Today'].push(n);
    else if (n.time >= weekTs) groups['This Week'].push(n);
    else groups['Earlier'].push(n);
  });
  return groups;
}
