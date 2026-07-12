'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { getScoreLabel } from '@/lib/utils/scoreColor';
import { useI18n } from '@/lib/i18n/context';

interface CredibilityBarProps {
  score: number;
  className?: string;
  compact?: boolean;
}

function clampScore(score: number) {
  return Math.min(100, Math.max(0, Number.isFinite(score) ? Math.round(score) : 0));
}

export function CredibilityBar({ score, className, compact = false }: CredibilityBarProps) {
  const { t } = useI18n();
  const clamped = clampScore(score);
  const label = getScoreLabel(clamped);

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
      aria-label={`${t('credibility.score')}: ${clamped}/100, ${label}`}
    >
      <div className={cn('flex items-center justify-between gap-3', compact ? 'mb-1' : 'mb-1.5')}>
        <span className={cn('truncate font-semibold text-muted', compact ? 'text-[9px]' : 'text-[10px]')}>
          {compact ? label : t('credibility.score')}
        </span>
        <span className={cn('flex-shrink-0 font-bold tabular-nums text-ink', compact ? 'text-[10px]' : 'text-[11px]')}>
          {clamped}
          {!compact && <span className="font-semibold text-subtle">/100</span>}
        </span>
      </div>

      <div className="relative w-full flex items-center">
        <div
          className={cn('w-full overflow-hidden', compact ? 'h-1.5' : 'h-2')}
          style={{ background: 'rgb(var(--c-rule))' }}
        >
          <div
            className="h-full transition-[width] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${animatedScore}%`, background: 'rgb(var(--c-ink))' }}
            aria-hidden="true"
          />
        </div>
        <div
          className={cn(
            'absolute top-1/2 pointer-events-none transition-[left,opacity] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5',
          )}
          style={{
            left: `${animatedScore}%`,
            transform: 'translate(-50%, -50%)',
            background: 'rgb(var(--c-ink))',
            borderRadius: '50%',
          }}
        />
      </div>

      {!compact && (
        <div className="mt-1 flex items-center justify-between text-[9px] font-semibold text-muted">
          <span>{t('credibility.low')}</span>
          <span>{t('credibility.moderate')}</span>
          <span>{t('credibility.high')}</span>
        </div>
      )}
    </div>
  );
}
