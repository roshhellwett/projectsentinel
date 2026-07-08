'use client';

import { Flame, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/i18n-shared';

interface EngagementCounterProps {
  dailyCount: number;
  streak: number;
  nextMilestone: number;
  className?: string;
}

export function EngagementCounter({
  dailyCount,
  streak,
  nextMilestone,
  className,
}: EngagementCounterProps) {
  const { t } = useI18n();
  const progressPct = Math.min(100, (dailyCount / nextMilestone) * 100);

  if (dailyCount === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'animate-slide-up inline-flex items-center gap-3 px-4 py-2 rounded-full',
        'bg-paper-tint border border-rule',
        'will-change-transform transform-gpu',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-accent" strokeWidth={2.2} />
        <span
          key={dailyCount}
          className="text-[13px] font-bold tabular-nums text-ink transition-all duration-200"
        >
          {dailyCount}
        </span>
        <span className="text-[11px] text-muted font-medium">{t('common.today')}</span>
      </div>

      <div className="relative w-14 h-1.5 rounded-full bg-rule overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <span className="text-[10px] text-subtle font-semibold tabular-nums">
        {nextMilestone - dailyCount} {t('common.to_go')}
      </span>

      {streak > 0 && (
        <div className="flex items-center gap-1 pl-2 border-l border-rule">
          <Flame
            className={cn(
              'w-3.5 h-3.5 text-streak',
              streak >= 3 && 'animate-streak-glow'
            )}
            strokeWidth={2.2}
          />
          <span className="text-[11px] font-bold text-streak tabular-nums">
            {streak}d
          </span>
        </div>
      )}
    </div>
  );
}
