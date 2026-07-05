'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { getScoreHex, getScoreLabel } from '@/lib/utils/scoreColor';
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

function getGradientColors(score: number): [string, string] {
  if (score >= 85) return ['#10b981', '#06b6d4'];
  if (score >= 60) return ['#f59e0b', '#f97316'];
  return ['#ef4444', '#f97316'];
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
  const color = getScoreHex(clamped);
  const label = getScoreLabel(clamped);
  const isHigh = clamped >= 85;
  const rawId = useId();
  const gradientId = `grad-${rawId.replace(/:/g, '')}`;
  const [gradFrom, gradTo] = getGradientColors(clamped);
  
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimated(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ringSize = compact ? 32 : size;
  const ringStroke = compact ? 2.5 : strokeWidth;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = animated ? ringCircumference * (1 - clamped / 100) : ringCircumference;

  return (
    <div
      className={cn('inline-flex items-center gap-2', className)}
      role="img"
      aria-label={`Credibility score: ${clamped} out of 100, ${label}`}
    >
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          className="-rotate-90"
        >
          {/* Gradient definition for high scores */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradFrom} />
              <stop offset="100%" stopColor={gradTo} />
            </linearGradient>
          </defs>

          {/* Track — subtle */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke="rgb(var(--c-rule))"
            strokeWidth={ringStroke}
            strokeOpacity={0.35}
          />

          {/* Fill — uses gradient for premium look */}
          <circle
            ref={ref}
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={ringStroke}
            strokeLinecap="round"
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringOffset}
            className="score-circle"
          />
        </svg>

        {/* Center number */}
        <span 
          className={cn(
            'absolute inset-0 flex items-center justify-center font-bold tabular-nums text-ink leading-none',
            compact ? 'text-[10px]' : 'text-[13px]'
          )}
        >
          {clamped}
        </span>
      </div>
      {showLabel && (
        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}
