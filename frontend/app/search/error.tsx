'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertOctagon, RefreshCw, ChevronDown, ChevronUp, TerminalSquare } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/i18n-shared';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const { t } = useI18n();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent-soft/50 border border-accent/20 flex items-center justify-center mb-6">
        <AlertOctagon className="w-8 h-8 md:w-10 md:h-10 text-accent" strokeWidth={1.5} />
      </div>
      
      <p className="text-accent text-[11px] font-bold tracking-[0.18em] uppercase mb-3">{t('common.system_error')}</p>
      <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-ink mb-4 leading-[1.05]">
        {t('common.error')}
      </h1>
      
      <p className="text-muted max-w-md mb-8 text-base leading-relaxed">
        We encountered an unexpected issue while loading this page. 
        Try refreshing or return to the verified feed.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded border border-ink bg-ink text-paper text-sm font-semibold hover:bg-ink/90 transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <RefreshCw className="w-4 h-4" />
          {t('common.retry')}
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded border border-rule-strong bg-paper text-ink text-sm font-semibold hover:border-ink hover:bg-paper-2 transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Return to home
        </Link>
      </div>

      <div className="mt-12 w-full max-w-lg">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors px-3 py-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent w-full sm:w-auto mx-auto"
          aria-expanded={showDetails}
        >
          <TerminalSquare className="w-3.5 h-3.5" />
          {showDetails ? 'Hide technical details' : 'Show technical details'}
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        
        {showDetails && (
          <div className="mt-4 p-4 rounded-md bg-paper-2 border border-rule text-left overflow-x-auto">
            <p className="text-sm font-mono font-semibold text-ink mb-2">Error digest: {error.digest || 'N/A'}</p>
            <p className="text-xs font-mono text-muted whitespace-pre-wrap break-all">
              {error.message || 'Unknown error occurred'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
