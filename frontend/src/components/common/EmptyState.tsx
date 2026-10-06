import React from 'react';
import { FileQuestion, Plus, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'No records were returned from the server for this query.',
  actionText,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-900/40 backdrop-blur-xs ${className}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        {icon || <FileQuestion className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 flex items-center gap-1.5 rounded-xl bg-[#00F9C7] px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#00E5B6] shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
