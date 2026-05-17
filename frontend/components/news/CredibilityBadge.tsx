'use client';

// last edited 2026-05-17 by roshhellwett

import { cn } from '@/lib/utils/cn';
import { getScoreHex, getScoreLabel } from '@/lib/utils/scoreColor';

interface CredibilityBadgeProps {
  score: number;
  showTooltip?: boolean;
  compact?: boolean;
}

export function CredibilityBadge({ score, showTooltip = false, compact = false }: CredibilityBadgeProps) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(score) ? Math.round(score) : 0));
  const label = getScoreLabel(clamped);
  const scoreColor = getScoreHex(clamped);

  return (
    <div
      className={cn(
        'relative group inline-flex max-w-full items-center rounded-full border border-slate-950/[0.10] bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]',
        compact ? 'gap-2 px-2.5 py-1.5' : 'gap-3 px-3 py-2',
      )}
      aria-label={`Credibility score: ${clamped}/100, ${label}`}
      role="img"
    >
      <div className={cn('flex min-w-0 flex-col', compact ? 'w-16' : 'w-24')}>
        <div className="mb-1 flex items-center justify-between gap-2">
          {!compact && (
            <span className="truncate text-[9px] font-bold uppercase tracking-wider text-slate-500">
              {label}
            </span>
          )}
          <span className={cn('font-black tabular-nums text-slate-950', compact ? 'text-[11px]' : 'text-xs')}>
            {clamped}
          </span>
        </div>
        <div
          className="relative h-1.5 rounded-full bg-slate-950/[0.08]"
          style={{ background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)' }}
        >
          <div
            className="absolute inset-0 rounded-full bg-white/45"
            style={{ clipPath: `inset(0 0 0 ${clamped}%)` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {!compact && <div className="h-5 w-px flex-shrink-0 bg-slate-950/10" aria-hidden="true" />}

      {!compact && (
        <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500" aria-hidden="true">
          Credibility
        </span>
      )}

      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-white border border-slate-950/[0.10] text-xs text-slate-950 font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
          role="tooltip"
        >
          {label} · score {clamped}/100
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
        </div>
      )}
    </div>
  );
}
