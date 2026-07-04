'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { ANIMATION } from '@/lib/theme/animations';
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

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimatedScore(clamped);
    }, 150);
    return () => clearTimeout(t);
  }, [clamped]);

  return (
    <div
      className={cn('w-full min-w-0 flex-shrink-0', className)}
      role="img"
      aria-label={`Credibility score: ${clamped} out of 100, ${label}`}
    >
      <div className={cn('flex items-center justify-between gap-3', compact ? 'mb-1' : 'mb-1.5')}>
        <span className={cn('truncate font-semibold text-muted', compact ? 'text-[9px]' : 'text-[10px]')}>
          {compact ? label : 'Credibility score'}
        </span>
        <span className={cn('flex-shrink-0 font-bold tabular-nums text-ink', compact ? 'text-[10px]' : 'text-[11px]')}>
          {clamped}
          {!compact && <span className="font-semibold text-subtle"> / 100</span>}
        </span>
      </div>

      <div className="relative w-full flex items-center">
        <div
          className={cn('w-full rounded-full overflow-hidden bg-ink/[0.08]', compact ? 'h-1.5' : 'h-2')}
          style={{ background: 'linear-gradient(to right, #ef4444 0%, #ea580c 25%, #eab308 50%, #84cc16 75%, #22c55e 100%)' }}
        >
          <div
            className={cn("absolute inset-0 rounded-full bg-paper/50 dark:bg-paper/70", ANIMATION.slow)}
            style={{ clipPath: `inset(0 0 0 ${animatedScore}%)` }}
            aria-hidden="true"
          />
        </div>
        <div
          className={cn(
            'absolute top-1/2 rounded-full border-[1.5px] border-paper bg-paper pointer-events-none', ANIMATION.slow,
            compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5',
          )}
          style={{ 
            left: `max(${compact ? '5px' : '7px'}, min(calc(100% - ${compact ? '5px' : '7px'}), ${animatedScore}%))`, 
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 0 1px ${scoreColor}, 0 2px 6px -1px ${scoreColor}80` 
          }}
        />
      </div>

      {!compact && (
        <div className="mt-1 flex items-center justify-between text-[9px] font-semibold text-subtle">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
        </div>
      )}
    </div>
  );
}
