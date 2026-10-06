import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading meeting intelligence...',
  subtext = 'Fetching verified data from API endpoint',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50 backdrop-blur-xs ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative mb-4">
        <div className="h-10 w-10 rounded-full border-2 border-slate-200 dark:border-slate-800" />
        <Loader2 className="h-10 w-10 text-[#00F9C7] animate-spin absolute top-0 left-0" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
        {message}
      </h3>
      {subtext && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtext}
        </p>
      )}
    </div>
  );
};
