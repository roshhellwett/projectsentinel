'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-white/70 border border-slate-950/[0.10] flex items-center justify-center mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <AlertTriangle className="w-10 h-10 text-cred-low" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-950 mb-3">Something went wrong</h1>
      <p className="text-slate-600 max-w-md mb-8">
        An unexpected error occurred. Try refreshing the page or go back to the homepage.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white font-semibold hover:bg-accent-hover transition-colors shadow-glow-accent"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-950/[0.12] text-slate-700 font-semibold hover:bg-slate-950/[0.06] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
