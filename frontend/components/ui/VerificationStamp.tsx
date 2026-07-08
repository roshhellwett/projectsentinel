'use client';

import { cn } from '@/lib/utils/cn';

interface VerificationStampProps {
  score: number;
  date?: string;
  compact?: boolean;
  xsmall?: boolean;
  className?: string;
}

function CheckIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function VerificationStamp({ score, date, compact, xsmall, className }: VerificationStampProps) {
  if (xsmall) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 border border-ink/25 text-ink font-mono text-[10px] leading-none',
          className,
        )}
        aria-label={`Credibility ${score}%`}
      >
        <CheckIcon />
        <span>{score}%</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 border border-ink/25 text-ink',
          className,
        )}
        aria-label={`Credibility ${score}%`}
      >
        <CheckIcon />
        <span className="font-mono text-xs leading-none">{score}%</span>
        <span className="font-body text-[9px] font-bold tracking-wider uppercase text-ink-soft leading-none">ver.</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 border border-ink/25 text-ink',
        className,
      )}
      aria-label={`Credibility score ${score} percent`}
    >
      <CheckIcon />
      <span className="font-mono text-sm leading-none font-medium">{score}%</span>
      <span className="font-body text-[10px] font-bold tracking-wider uppercase text-ink-soft leading-none">verified</span>
    </div>
  );
}
