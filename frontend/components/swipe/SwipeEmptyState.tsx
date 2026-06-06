'use client';

import Link from 'next/link';
import { Flame, Layers, Newspaper } from 'lucide-react';

interface SwipeEmptyStateProps {
  cardsToday: number;
  uniqueHostsToday: number;
  streak: number;
  onRefresh?: () => void;
  isFetching?: boolean;
}

export function SwipeEmptyState({
  cardsToday,
  uniqueHostsToday,
  streak,
  onRefresh,
  isFetching = false,
}: SwipeEmptyStateProps) {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-10 text-center">
      <span className="block w-12 h-[2px] bg-accent mx-auto mb-5" aria-hidden="true" />
      <h2 className="font-display text-2xl font-bold text-ink mb-2">You&apos;re caught up.</h2>
      <p className="text-[13px] text-muted mb-8">
        No more verified stories right now. Check back in a few minutes.
      </p>

      <dl className="grid grid-cols-3 gap-3 mb-8 text-left">
        <Stat icon={<Layers className="w-3.5 h-3.5 text-accent" />} value={cardsToday} label="read today" />
        <Stat icon={<Newspaper className="w-3.5 h-3.5 text-accent" />} value={uniqueHostsToday} label="sources" />
        <Stat icon={<Flame className="w-3.5 h-3.5 text-accent" />} value={streak} label={streak === 1 ? 'day streak' : 'day streak'} />
      </dl>

      <div className="flex flex-col gap-2">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="w-full px-4 py-2.5 bg-ink text-paper text-[13px] font-semibold rounded hover:bg-ink/90 transition-colors disabled:opacity-60 disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {isFetching ? 'Checking…' : 'Check for new stories'}
          </button>
        )}
        <Link
          href="/"
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-rule-strong text-[12px] font-semibold text-ink hover:bg-paper-2 transition-colors rounded"
        >
          Back to grid
        </Link>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1 px-3 py-2.5 bg-paper-2 border border-rule rounded">
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
        {icon}
        <span>{label}</span>
      </span>
      <span className="font-display text-2xl font-bold text-ink tabular-nums leading-none">{value}</span>
    </div>
  );
}
