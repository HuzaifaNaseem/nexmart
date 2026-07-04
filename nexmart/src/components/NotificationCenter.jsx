import { useState, useEffect, useRef, useMemo } from 'react';
import { buildNotifications, timeAgo, groupNotifications } from '../utils/notifications';
import { getNotifReadState, setNotifReadState } from '../utils/notifStorage';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [readState, setReadState] = useState(getNotifReadState);
  const panelRef = useRef(null);
  const notifications = useMemo(() => buildNotifications(), []);

  const unreadCount = notifications.filter(n => !readState[n.id]).length;
  const grouped = useMemo(() => groupNotifications(notifications), [notifications]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markRead = (id) => {
    const next = { ...readState, [id]: true };
    setReadState(next);
    setNotifReadState(next);
  };

  const markAllRead = () => {
    const next = { ...readState };
    notifications.forEach(n => { next[n.id] = true; });
    setReadState(next);
    setNotifReadState(next);
  };

  const handleClick = (n) => {
    markRead(n.id);
    if (n.link) window.location.hash = n.link;
    setOpen(false);
  };

  return (
    <div className="notif-bell" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative dm-text hover:text-accent transition-colors btn-press p-1"
        aria-label="Notifications"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel dm-card border dm-border">
          <div className="flex items-center justify-between px-5 py-4 border-b dm-border">
            <div>
              <h3 className="font-heading font-bold dm-text">Notifications</h3>
              {unreadCount > 0 && <p className="text-xs dm-text-muted mt-0.5">{unreadCount} unread</p>}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold text-accent hover:underline btn-press">
                Mark all as read
              </button>
            )}
          </div>

          <div className="notif-panel-body">
            {Object.entries(grouped).map(([label, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={label}>
                  <div className="notif-group-label dm-text-muted">{label}</div>
                  {items.map(n => (
                    <div key={n.id} className={`notif-item ${!readState[n.id] ? 'unread' : ''}`} onClick={() => handleClick(n)}>
                      <div className={`notif-icon ${n.iconBg}`}><span>{n.icon}</span></div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm dm-text truncate ${!readState[n.id] ? 'font-bold' : 'font-medium'}`}>{n.title}</p>
                        <p className="text-xs dm-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[10px] dm-text-muted mt-1">{timeAgo(n.time)}</p>
                      </div>
                      {!readState[n.id] && <div className="w-2 h-2 rounded-full bg-accent shrink-0 self-center"/>}
                    </div>
                  ))}
                </div>
              );
            })}

            {notifications.length === 0 && (
              <div className="py-12 text-center">
                <span className="text-4xl">🔔</span>
                <p className="dm-text font-semibold mt-3">All caught up!</p>
                <p className="text-sm dm-text-muted mt-1">No new notifications</p>
              </div>
            )}
          </div>

          <div className="border-t dm-border p-3">
            <button
              onClick={() => { window.location.hash = '#/track'; setOpen(false); }}
              className="w-full text-center text-sm font-semibold text-accent hover:underline py-1 btn-press"
            >
              View Order History →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
