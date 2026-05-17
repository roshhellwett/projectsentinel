'use client';

// last edited 2026-05-17 by roshhellwett
//
// Visual feedback rendered on top of the active swipe card. Reads the live
// drag offset and fades in directional badges (Save / Dismiss / Next /
// Previous) as the user drags past meaningful thresholds.

import { Bookmark, X, ChevronUp, ChevronDown } from 'lucide-react';

interface SwipeOverlayProps {
  drag: { x: number; y: number };
}

const TRIGGER = 110;

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function SwipeOverlay({ drag }: SwipeOverlayProps) {
  const { x, y } = drag;
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  const horizontalDominant = ax > ay;

  const opaSave    = horizontalDominant && x > 0  ? clamp01(x / TRIGGER) : 0;
  const opaDismiss = horizontalDominant && x < 0  ? clamp01(-x / TRIGGER) : 0;
  const opaNext    = !horizontalDominant && y < 0 ? clamp01(-y / TRIGGER) : 0;
  const opaPrev    = !horizontalDominant && y > 0 ? clamp01(y / TRIGGER) : 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-[40]">
      <Badge
        label="Save"
        icon={<Bookmark className="w-4 h-4" />}
        opacity={opaSave}
        position="right"
        accent="border-cred-high text-cred-high bg-paper"
      />
      <Badge
        label="Dismiss"
        icon={<X className="w-4 h-4" />}
        opacity={opaDismiss}
        position="left"
        accent="border-rule-strong text-muted bg-paper"
      />
      <Badge
        label="Next"
        icon={<ChevronUp className="w-4 h-4" />}
        opacity={opaNext}
        position="bottom"
        accent="border-accent text-accent bg-paper"
      />
      <Badge
        label="Previous"
        icon={<ChevronDown className="w-4 h-4" />}
        opacity={opaPrev}
        position="top"
        accent="border-rule-strong text-ink bg-paper"
      />
    </div>
  );
}

type BadgePosition = 'left' | 'right' | 'top' | 'bottom';

const POSITION_STYLE: Record<BadgePosition, React.CSSProperties> = {
  right:  { top: '50%', right: '1.25rem', transform: 'translateY(-50%)' },
  left:   { top: '50%', left:  '1.25rem', transform: 'translateY(-50%)' },
  bottom: { bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)' },
  top:    { top: '1.5rem',    left: '50%', transform: 'translateX(-50%)' },
};

function Badge({
  label,
  icon,
  opacity,
  position,
  accent,
}: {
  label: string;
  icon: React.ReactNode;
  opacity: number;
  position: BadgePosition;
  accent: string;
}) {
  if (opacity <= 0.02) return null;
  const base = POSITION_STYLE[position];
  const scale = 0.9 + opacity * 0.1;
  const composedTransform = `${base.transform ?? ''} scale(${scale})`.trim();
  return (
    <div
      className={`absolute inline-flex items-center gap-2 px-3 py-1.5 border-2 rounded-md text-[11px] font-bold uppercase tracking-[0.18em] shadow-paper-lift ${accent}`}
      style={{ ...base, transform: composedTransform, opacity }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
