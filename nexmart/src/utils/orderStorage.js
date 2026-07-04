export function saveLastOrder(order) {
  localStorage.setItem('nexmart_last_order', JSON.stringify({
    ...order,
    date: order.date || new Date().toISOString()
  }));
}

export function getLastOrder() {
  try { return JSON.parse(localStorage.getItem('nexmart_last_order')); }
  catch { return null; }
}
