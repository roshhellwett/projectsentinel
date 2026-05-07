/**
 * Credibility score badge with color coding
 * Optimized: uses shared utility, accessibility attrs, focus-visible tooltip
 */

import { getScoreColor, getScoreLabel } from '@/lib/utils/scoreColor';

interface CredibilityBadgeProps {
  score: number;
  showTooltip?: boolean;
}

export function CredibilityBadge({ score, showTooltip = false }: CredibilityBadgeProps) {
  const colorClass = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="relative group">
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${colorClass}`}
        aria-label={`Credibility: ${score} out of 100, ${label}`}
      >
        {score}/100
      </span>

      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-surface-hover text-sm text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
          role="tooltip"
        >
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-hover" />
        </div>
      )}
    </div>
  );
}
