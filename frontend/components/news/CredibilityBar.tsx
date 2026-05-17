'use client';

// last edited 2026-05-17 by roshhellwett

import { cn } from '@/lib/utils/cn';
import { getScoreHex, getScoreLabel } from '@/lib/utils/scoreColor';

interface CredibilityBarProps {
  score: number;
  className?: string;
  compact?: boolean;
}

function clampScore(score: number) {
  return Math.min(100, Math.max(0, Number.isFinite(score) ? Math.round(score) : 0));
}

export function CredibilityBar({ score, className, compact = false }: CredibilityBarProps) {
  const clamped = clampScore(score);
  const label = getScoreLabel(clamped);
  const scoreColor = getScoreHex(clamped);

  return (
    <div
      className={cn('w-full min-w-0 flex-shrink-0', className)}
      role="img"
      aria-label={`Credibility score: ${clamped} out of 100, ${label}`}
    >
      <div className={cn('flex items-center justify-between gap-3', compact ? 'mb-1' : 'mb-1.5')}>
        <span className={cn('truncate font-semibold text-slate-500', compact ? 'text-[9px]' : 'text-[10px]')}>
          {compact ? label : 'Credibility score'}
        </span>
        <span className={cn('flex-shrink-0 font-bold tabular-nums text-slate-800', compact ? 'text-[10px]' : 'text-[11px]')}>
          {clamped}
          {!compact && <span className="font-semibold text-slate-400"> / 100</span>}
        </span>
      </div>

      <div
        className={cn('relative w-full rounded-full bg-slate-950/[0.08]', compact ? 'h-1.5' : 'h-2')}
        style={{ background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)' }}
      >
        <div
          className="absolute inset-0 rounded-full bg-white/45"
          style={{ clipPath: `inset(0 0 0 ${clamped}%)` }}
          aria-hidden="true"
        />
        <div
          className={cn(
            'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-[0_1px_6px_rgba(15,23,42,0.20)]',
            compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5',
          )}
          style={{ left: `${clamped}%`, boxShadow: `0 0 0 1px ${scoreColor}, 0 4px 12px -6px ${scoreColor}` }}
        />
      </div>

      {!compact && (
        <div className="mt-1 flex items-center justify-between text-[9px] font-semibold text-slate-400">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
        </div>
      )}
    </div>
  );
}
