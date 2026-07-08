'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Layers, Newspaper, CheckCircle2 } from 'lucide-react';

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
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleRefresh = () => {
    if (cooldown > 0 || isFetching) return;
    onRefresh?.();
    setCooldown(15);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-10 text-center">
      <div className="w-16 h-16 rounded-full bg-paper/70 backdrop-blur-sm border border-rule/50 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-7 h-7 text-accent" />
      </div>
      <h2 className="font-display text-2xl font-bold text-ink tracking-[-0.015em] mb-2">You&apos;re caught up.</h2>
      <p className="text-[13px] text-muted mb-8">
        No more verified stories right now. Check back in a few minutes.
      </p>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 text-left">
        <Stat icon={<Layers className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />} value={cardsToday} label="read today" />
        <Stat icon={<Newspaper className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />} value={uniqueHostsToday} label="sources" />
        <Stat icon={<Flame className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />} value={streak} label={streak === 1 ? 'day' : 'days'} />
      </dl>

      <div className="flex flex-col gap-2">
        {onRefresh && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching || cooldown > 0}
            className="w-full px-4 pt-[9px] pb-[11px] bg-ink text-paper text-[13px] font-semibold rounded hover:bg-ink/90 hover-lift transition-colors disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {isFetching ? 'Checking…' : cooldown > 0 ? `Wait ${cooldown}s` : 'Check for new stories'}
          </button>
        )}
        <Link
          href="/"
          className="w-full tap-target min-h-[44px] inline-flex items-center justify-center px-4 pt-[7px] pb-[9px] border border-rule-strong text-[12px] font-semibold text-ink hover:bg-paper-2 hover-lift transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Back to grid
        </Link>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1 px-3 py-2.5 bg-paper-2/65 backdrop-blur-sm border border-rule/50 rounded">
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
        {icon}
        <span>{label}</span>
      </span>
      <span className="font-display text-2xl font-bold text-ink tabular-nums leading-none">{value}</span>
    </div>
  );
}
