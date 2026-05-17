'use client';

// last edited 2026-05-17 by roshhellwett

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('App error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <span aria-hidden="true" className="block w-12 h-[2px] bg-accent mb-5" />
      <p className="editorial-kicker mb-3">Server error</p>
      <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-ink mb-4 leading-[1.05]">Something went wrong</h1>
      <p className="text-ink-soft max-w-md mb-8 text-base leading-relaxed">
        An unexpected error occurred. Try refreshing the page or go back to the homepage.
      </p>
      <div className="flex gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-ink bg-ink text-paper text-sm font-semibold hover:bg-ink-soft transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-rule-strong text-ink text-sm font-semibold hover:border-ink hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
