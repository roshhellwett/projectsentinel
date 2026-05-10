'use client';

import { getScoreLabel, getScoreTier } from '@/lib/utils/scoreColor';

interface CredibilityBadgeProps {
  score: number;
  showTooltip?: boolean;
  compact?: boolean;
}

export function CredibilityBadge({ score, showTooltip = false, compact = false }: CredibilityBadgeProps) {
  const tier = getScoreTier(score);
  const label = getScoreLabel(score);

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  const ringBg =
    tier === 'high' ? 'text-cred-high/15'
    : tier === 'mid' ? 'text-cred-mid/15'
    : 'text-cred-low/15';

  const ringFg =
    tier === 'high' ? 'text-cred-high'
    : tier === 'mid' ? 'text-cred-mid'
    : 'text-cred-low';

  return (
    <div
      className="relative group inline-flex items-center gap-2 max-w-full"
      aria-label={`Credibility score: ${score}/100 — ${label}`}
      role="img"
    >
      <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center">
        <svg className="w-9 h-9 -rotate-90" viewBox="0 0 40 40">
          <circle
            className={`${ringBg} stroke-current`}
            strokeWidth="3"
            fill="transparent"
            r={radius}
            cx="20"
            cy="20"
          />
          <circle
            className={`${ringFg} stroke-current score-ring-animate`}
            strokeWidth="3"
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="20"
            cy="20"
            style={
              {
                strokeDasharray: circumference,
                strokeDashoffset: circumference,
                ['--score-offset' as string]: String(offset),
              } as React.CSSProperties
            }
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-slate-950 tabular-nums">{score}</span>
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col justify-center min-w-0 max-w-[120px]" aria-hidden="true">
          <span className="text-[10px] font-bold text-slate-950 uppercase tracking-wider leading-none mb-0.5 truncate">
            {label}
          </span>
          <span className="text-[9px] text-slate-500 font-medium leading-none truncate">
            Credibility
          </span>
        </div>
      )}

      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-white border border-slate-950/[0.10] text-xs text-slate-950 font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
          role="tooltip"
        >
          {label} · score {score}/100
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
        </div>
      )}
    </div>
  );
}
