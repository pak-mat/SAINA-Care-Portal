import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-red-100 dark:border-red-900/30 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Something went wrong</h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
              We've encountered an unexpected error. Our team has been notified. 
              You can try refreshing the page to see if that resolves the issue.
            </p>
            
            <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 mb-8 text-left overflow-hidden border border-red-100/50 dark:border-red-900/20">
              <p className="text-xs font-mono text-red-800 dark:text-red-300 break-words">
                {this.state.error?.name === 'DatabaseError' 
                  ? `[DB_ERROR] ${this.state.error.message}`
                  : (this.state.error?.message || 'Unknown Error')}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <RefreshCw size={16} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default GlobalErrorBoundary;
