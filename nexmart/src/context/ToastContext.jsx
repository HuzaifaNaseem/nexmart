import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({ addToast: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, icon = '✓', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, icon, out: false }]);
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, out: true } : t)), duration);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration + 350);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast dm-card border dm-border ${t.out ? 'out' : ''}`}>
            <span className="text-lg">{t.icon}</span>
            <span className="text-sm font-medium dm-text">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }
