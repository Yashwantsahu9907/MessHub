import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  if (!isOpen) return null;

  const typeColors = {
    warning: {
      iconBg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      btnBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white',
    },
    danger: {
      iconBg: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
      btnBg: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 text-white',
    },
    info: {
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      btnBg: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white',
    }
  };

  const colors = typeColors[type] || typeColors.warning;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Card */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-scale-up space-y-4 transition-colors duration-300">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850"
        >
          <X size={18} />
        </button>

        <div className="flex gap-4">
          <div className={`p-3 rounded-2xl shrink-0 h-fit ${colors.iconBg}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-normal">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-750 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition focus:ring-2 focus:ring-offset-2 ${colors.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
