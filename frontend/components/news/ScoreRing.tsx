'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

function clampScore(score: number) {
  return Math.min(100, Math.max(0, Number.isFinite(score) ? Math.round(score) : 0));
}

export function ScoreRing({ 
  score, 
  size = 44, 
  strokeWidth = 3.5,
  className,
  showLabel = false,
  compact = false,
}: ScoreRingProps) {
  const clamped = clampScore(score);
  
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimated(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ringSize = compact ? 32 : size;
  const ringStroke = compact ? 2.5 : strokeWidth;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = animated ? ringCircumference * (1 - clamped / 100) : ringCircumference;

  const strokeThickness = Math.max(1.5, ringStroke * (clamped / 100));

  return (
    <div
      className={cn('inline-flex items-center gap-2 flex-shrink-0', className)}
      role="img"
      aria-label={`Credibility score: ${clamped} out of 100`}
    >
      <div className="relative flex-shrink-0" style={{ width: ringSize, height: ringSize }}>
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          className="-rotate-90 overflow-visible"
          aria-hidden="true"
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke="rgb(var(--c-rule))"
            strokeWidth={ringStroke}
          />

          <circle
            ref={ref}
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke="rgb(var(--c-ink))"
            strokeWidth={strokeThickness}
            strokeLinecap="round"
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringOffset}
          />
        </svg>

        <span 
          className={cn(
            'absolute inset-0 flex items-center justify-center font-mono text-ink leading-none pointer-events-none',
            compact ? 'text-[10px]' : 'text-[13px]'
          )}
          aria-hidden="true"
        >
          {clamped}
        </span>
      </div>
      {showLabel && (
        <span className="font-body text-[10px] font-bold tracking-wider uppercase text-muted">
          verified
        </span>
      )}
    </div>
  );
}
