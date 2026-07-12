"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertOctagon, RefreshCw, Trash2, WifiOff } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Maximum number of auto-retry attempts */
  maxRetries?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  isOffline: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  static defaultProps = {
    maxRetries: 3,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isOffline: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      isOffline: typeof navigator !== "undefined" && !navigator.onLine,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    // Auto-retry with backoff if online
    if (
      this.props.maxRetries! > 0 &&
      typeof navigator !== "undefined" &&
      navigator.onLine
    ) {
      const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 8000);
      setTimeout(() => {
        this.setState((prev) => {
          if (prev.retryCount >= this.props.maxRetries!) return prev;
          return {
            hasError: false,
            error: null,
            retryCount: prev.retryCount + 1,
            isOffline: false,
          };
        });
      }, delay);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, retryCount: 0 });
  };

  handleClearCacheAndReload = () => {
    try {
      if (typeof window !== "undefined") {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && (k.startsWith("zenith_cache_") || k.startsWith("iv:"))) {
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

      const isOffline =
        this.state.isOffline ||
        (typeof navigator !== "undefined" && !navigator.onLine);

      return (
        <div
          className="flex flex-col items-center justify-center py-12 px-4 text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-12 h-12 rounded-full bg-accent-soft/50 border border-accent/20 flex items-center justify-center mb-4 shadow-sm">
            {isOffline ? (
              <WifiOff className="w-6 h-6 text-cred-mid" strokeWidth={1.5} />
            ) : (
              <AlertOctagon className="w-6 h-6 text-accent" strokeWidth={1.5} />
            )}
          </div>
          <h3 className="text-base font-bold text-ink mb-1">
            {isOffline ? "You are offline" : "Section Unavailable"}
          </h3>
          <p className="text-sm text-muted max-w-sm mb-5">
            {isOffline
              ? "Connect to the internet to refresh this content. Cached stories are still available."
              : "Something went wrong loading this content. This may be due to a temporary network issue or stale browser cache."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="tap-target min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-rule bg-paper text-ink hover:bg-rule/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
            {!isOffline && (
              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="tap-target min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Cache & Reload
              </button>
            )}
          </div>
          {this.state.retryCount > 0 && (
            <p className="text-xs text-muted mt-4">
              Auto-retry {this.state.retryCount}/{this.props.maxRetries}...
            </p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
