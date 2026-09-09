import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ type = 'success', message, onClose }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 icon-emerald-600',
    error: 'bg-rose-50 border-rose-200 text-rose-800 icon-rose-600',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800 icon-indigo-600',
  };

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[type] || Info;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 border rounded-2xl shadow-lg transition-all animate-in slide-in-from-bottom-5 duration-200 ${styles[type]}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:opacity-75 cursor-pointer ml-2">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
