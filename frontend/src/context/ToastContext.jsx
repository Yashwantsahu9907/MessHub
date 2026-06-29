import React, { createContext, useState, useContext, useCallback } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastIcons = {
    success: <CheckCircle className="text-emerald-500 w-5 h-5 shrink-0" />,
    error: <AlertCircle className="text-rose-500 w-5 h-5 shrink-0" />,
    warning: <AlertTriangle className="text-amber-500 w-5 h-5 shrink-0" />,
    info: <Info className="text-indigo-500 w-5 h-5 shrink-0" />,
  };

  const toastBorders = {
    success: 'border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/40 dark:border-emerald-500/10 text-emerald-800 dark:text-emerald-200',
    error: 'border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/40 dark:border-rose-500/10 text-rose-800 dark:text-rose-200',
    warning: 'border-amber-500/20 bg-amber-50/90 dark:bg-amber-950/40 dark:border-amber-500/10 text-amber-800 dark:text-amber-200',
    info: 'border-indigo-500/20 bg-indigo-50/90 dark:bg-indigo-950/40 dark:border-indigo-500/10 text-indigo-800 dark:text-indigo-200',
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-300 animate-slide-in-right ${toastBorders[t.type]}`}
          >
            <div className="flex items-center gap-3">
              {toastIcons[t.type]}
              <span className="text-sm font-semibold tracking-wide leading-tight">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none p-0.5 rounded-lg hover:bg-black/5 transition"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
