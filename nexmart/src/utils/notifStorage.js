export function getNotifReadState() {
  try { return JSON.parse(localStorage.getItem('nexmart_notif_read') || '{}'); }
  catch { return {}; }
}

export function setNotifReadState(state) {
  localStorage.setItem('nexmart_notif_read', JSON.stringify(state));
}

export function getNotifyState() {
  try { return JSON.parse(localStorage.getItem('nexmart_notify_stock') || '{}'); }
  catch { return {}; }
}

export function setNotifyProduct(productId) {
  const s = getNotifyState();
  s[productId] = true;
  localStorage.setItem('nexmart_notify_stock', JSON.stringify(s));
}
