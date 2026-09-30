export function buildNotifications() { return []; }

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
