import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ApiError } from '../../lib/api/types';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const isApiError = error instanceof ApiError;
      const statusCode = isApiError ? (error as ApiError).statusCode : null;

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-center dark:border-rose-500/20 dark:bg-rose-950/20">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="inline-block rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 mb-2">
              {statusCode ? `HTTP Status ${statusCode}` : 'Application Runtime Error'}
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {this.props.fallbackTitle ||
                (statusCode === 404
                  ? 'Requested Resource Not Found (404)'
                  : statusCode === 500
                  ? 'Internal Server Error (500)'
                  : 'Backend API Error')}
            </h3>

            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 font-mono bg-black/5 dark:bg-black/30 p-2.5 rounded-lg text-left break-all">
              {error?.message || 'An unexpected failure occurred while processing this request.'}
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Request</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
