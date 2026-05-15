'use client';

import { cn } from '@/lib/utils/cn';

interface CredibilityBarProps {
  score: number;
  className?: string;
}

export function CredibilityBar({ score, className }: CredibilityBarProps) {
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <div
      className={cn('w-full min-w-0 flex-shrink-0', className)}
      role="img"
      aria-label={`Credibility score: ${clamped} out of 100`}
    >
      {/* Label row above */}
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
          Credibility score
        </span>
        <span className="text-[10px] font-semibold tabular-nums text-slate-700 dark:text-slate-300">
          {clamped}
          <span className="text-slate-400 dark:text-slate-500"> / 100</span>
        </span>
      </div>

      {/* Gradient track */}
      <div
        className="relative h-1.5 w-full rounded-full"
        style={{ background: 'linear-gradient(to right, #e24b4a, #EF9F27, #639922)' }}
      >
        {/* Dot marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-700 dark:border-slate-300 shadow-sm"
          style={{ left: `${clamped}%` }}
        />
      </div>

      {/* Label row below */}
      <div className="flex justify-between items-center mt-1">
        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
          Low
        </span>
        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
          High
        </span>
      </div>
    </div>
  );
}
