'use client';

import { getScoreColor, getScoreLabel } from '@/lib/utils/scoreColor';

interface CredibilityBadgeProps {
  score: number;
  showTooltip?: boolean;
}

export function CredibilityBadge({ score, showTooltip = false }: CredibilityBadgeProps) {
  const colorClass = getScoreColor(score);
  const label = getScoreLabel(score);
  
  // Extract base colors for SVG styling
  const isHigh = score >= 80;
  const isMedium = score >= 60 && score < 80;
  
  const strokeColor = isHigh 
    ? 'text-india-green dark:text-emerald-400' 
    : isMedium 
      ? 'text-warning dark:text-amber-400' 
      : 'text-danger dark:text-red-400';
      
  const bgColor = isHigh 
    ? 'text-green-100 dark:text-green-900/30' 
    : isMedium 
      ? 'text-orange-100 dark:text-orange-900/30' 
      : 'text-red-100 dark:text-red-900/30';

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className="relative group inline-flex items-center gap-2"
      aria-label={`Credibility score: ${score}/100 — ${label}`}
      role="img"
    >
      <div className="relative w-10 h-10 flex items-center justify-center" aria-hidden="true">
        <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 40 40">
          <circle
            className={`${bgColor} stroke-current transition-colors duration-300`}
            strokeWidth="3.5"
            fill="transparent"
            r={radius}
            cx="20"
            cy="20"
          />
          <circle
            className={`${strokeColor} stroke-current score-ring-animate drop-shadow-sm`}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="20"
            cy="20"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: circumference,
              '--score-offset': strokeDashoffset
            } as React.CSSProperties & { '--score-offset': number }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-700 dark:text-slate-200">
          {score}
        </span>
      </div>
      
      <div className="flex flex-col justify-center" aria-hidden="true">
        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-none mb-0.5">
          {label}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">
          Credibility Score
        </span>
      </div>

      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-xs text-white font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700"
          role="tooltip"
        >
          {label} score indicates reliability based on cross-referencing {score}% of metrics
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
        </div>
      )}
    </div>
  );
}
