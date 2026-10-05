import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'warning'
            ? AlertCircle
            : Info;
        const iconColor =
          toast.type === 'success'
            ? 'text-emerald-500'
            : toast.type === 'warning'
            ? 'text-amber-500'
            : 'text-[#1D70F5]';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[#B0DEED] bg-white p-3.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-all duration-200 animate-in slide-in-from-bottom-3"
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {toast.title}
              </div>
              {toast.message && (
                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
