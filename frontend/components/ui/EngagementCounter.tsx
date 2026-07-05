'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  const reducedMotion = useReducedMotion();
  const progressPct = Math.min(100, (dailyCount / nextMilestone) * 100);

  if (dailyCount === 0) return null;

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 25 }}
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-3 px-4 py-2 rounded-full',
        'bg-paper border border-rule shadow-card',
        'will-change-transform transform-gpu',
        className
      )}
    >
      {/* Daily count with animated number */}
      <div className="flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-accent" strokeWidth={2.2} />
        <AnimatePresence mode="wait">
          <motion.span
            key={dailyCount}
            initial={reducedMotion ? {} : { y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? {} : { y: -8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[13px] font-bold tabular-nums text-ink"
          >
            {dailyCount}
          </motion.span>
        </AnimatePresence>
        <span className="text-[11px] text-muted font-medium">{t('common.today')}</span>
      </div>

      {/* Progress to next milestone */}
      <div className="relative w-14 h-1.5 rounded-full bg-rule overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <span className="text-[10px] text-subtle font-semibold tabular-nums">
        {nextMilestone - dailyCount} {t('common.to_go')}
      </span>

      {/* Streak badge */}
      {streak > 0 && (
        <div className="flex items-center gap-1 pl-2 border-l border-rule">
          <Flame
            className={cn(
              'w-3.5 h-3.5 text-streak',
              !reducedMotion && streak >= 3 && 'animate-streak-glow'
            )}
            strokeWidth={2.2}
          />
          <span className="text-[11px] font-bold text-streak tabular-nums">
            {streak}d
          </span>
        </div>
      )}
    </motion.div>
  );
}
