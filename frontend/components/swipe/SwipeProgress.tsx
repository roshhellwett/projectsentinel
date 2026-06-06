'use client';

import { Flame, Layers } from 'lucide-react';

interface SwipeProgressProps {
  consumedToday: number;
  remaining: number;
  streak: number;
  canRewind: boolean;
  onRewind: () => void;
}

export function SwipeProgress({ consumedToday, remaining, streak, canRewind, onRewind }: SwipeProgressProps) {
  return (
    <div className="w-full max-w-md mx-auto px-4 mb-2">
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-3 text-muted">
          <span className="inline-flex items-center gap-1 font-medium">
            <Layers className="w-3 h-3" aria-hidden="true" />
            <span className="tabular-nums text-ink">{consumedToday}</span>
            <span>read today</span>
          </span>
          {streak > 1 && (
            <span className="inline-flex items-center gap-1 font-medium" title={`${streak}-day streak`}>
              <Flame className="w-3 h-3 text-accent" aria-hidden="true" />
              <span className="tabular-nums text-ink">{streak}</span>
              <span>day streak</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-muted">
          {remaining > 0 && (
            <span className="font-medium tabular-nums">{remaining} ahead</span>
          )}
          <button
            type="button"
            onClick={onRewind}
            disabled={!canRewind}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink disabled:text-subtle disabled:cursor-not-allowed hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-1"
            aria-label="Go back one card"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
