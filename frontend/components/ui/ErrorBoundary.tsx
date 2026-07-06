'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertOctagon, RefreshCw, Trash2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleClearCacheAndReload = () => {
    try {
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && (k.startsWith('zenith_cache_') || k.startsWith('iv:'))) {
            keysToRemove.push(k);
          }
        }
        for (const k of keysToRemove) {
          window.localStorage.removeItem(k);
        }
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center" role="alert" aria-live="assertive">
          <div className="w-12 h-12 rounded-full bg-accent-soft/50 border border-accent/20 flex items-center justify-center mb-4 shadow-sm">
            <AlertOctagon className="w-6 h-6 text-accent" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-bold text-ink mb-1">Section Unavailable</h3>
          <p className="text-sm text-muted max-w-sm mb-5">
            Something went wrong loading this content. This may be due to a temporary network issue or stale browser cache.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="tap-target min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-rule bg-paper text-ink hover:bg-rule/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleClearCacheAndReload}
              className="tap-target min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Cache & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
