'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

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

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center" role="alert" aria-live="assertive">
          <div className="w-12 h-12 rounded-full bg-accent-soft/50 border border-accent/20 flex items-center justify-center mb-4">
            <AlertOctagon className="w-6 h-6 text-accent" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-muted max-w-sm mb-3">
            Something went wrong loading this section.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="tap-target min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-rule bg-paper-2 text-ink hover:bg-rule/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
