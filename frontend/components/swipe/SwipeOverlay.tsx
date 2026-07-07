'use client';

import { ArrowRight, ArrowDown, ArrowUp, Undo2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useMotionValueEvent, type MotionValue } from 'framer-motion';
import { safeRead, safeWrite } from '@/lib/utils/safeStorage';
import { Z_INDEX } from '@/lib/theme/zIndex';

interface SwipeOverlayProps {
  dragX: MotionValue<number>;
  dragY: MotionValue<number>;
  canRewind?: boolean;
}

const TRIGGER = 110;
const SEEN_KEY = 'iv:swipe:overlaySeen:v1';

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function SwipeOverlay({ dragX, dragY, canRewind = true }: SwipeOverlayProps) {
  const [hasSeen, setHasSeen] = useState(false);

  useEffect(() => {
    setHasSeen(safeRead(SEEN_KEY) === 'true');
  }, []);

  const [nextRight, setNextRight] = useState(0);
  const [prevLeft, setPrevLeft] = useState(0);
  const [nextUp, setNextUp] = useState(0);
  const [prevDown, setPrevDown] = useState(0);

  const lastSeenCheck = useRef(0);

  const updateOpa = useRef(() => {
    const x = dragX.get();
    const y = dragY.get();
    const ax = Math.abs(x);
    const ay = Math.abs(y);
    const hd = ax > ay;
    setNextRight(hd && x > 0 ? clamp01(x / TRIGGER) : 0);
    setPrevLeft(hd && x < 0 && canRewind ? clamp01(-x / TRIGGER) : 0);
    setNextUp(!hd && y < 0 ? clamp01(-y / TRIGGER) : 0);
    setPrevDown(!hd && y > 0 && canRewind ? clamp01(y / TRIGGER) : 0);

    if (!hasSeen && lastSeenCheck.current < Date.now() - 500) {
      const max = Math.max(
        hd && x > 0 ? clamp01(x / TRIGGER) : 0,
        hd && x < 0 && canRewind ? clamp01(-x / TRIGGER) : 0,
        !hd && y < 0 ? clamp01(-y / TRIGGER) : 0,
        !hd && y > 0 && canRewind ? clamp01(y / TRIGGER) : 0,
      );
      if (max > 0.6) {
        lastSeenCheck.current = Date.now();
        safeWrite(SEEN_KEY, true);
        setHasSeen(true);
      }
    }
  });

  useMotionValueEvent(dragX, 'change', () => { updateOpa.current(); });
  useMotionValueEvent(dragY, 'change', () => { updateOpa.current(); });

  if (hasSeen) return null;

  return (
    <motion.div className={`pointer-events-none absolute inset-0 ${Z_INDEX.dropdown} touch-action-manipulation`}>
      <Badge
        label="Next"
        icon={<ArrowRight className="w-4 h-4" />}
        opacity={nextRight}
        position="right"
        accent="border-accent text-accent bg-paper"
      />
      <Badge
        label="Previous"
        icon={<Undo2 className="w-4 h-4" />}
        opacity={prevLeft}
        position="left"
        accent="border-rule-strong text-ink bg-paper"
      />
      <Badge
        label="Next"
        icon={<ArrowUp className="w-4 h-4" />}
        opacity={nextUp}
        position="top"
        accent="border-accent text-accent bg-paper"
      />
      <Badge
        label="Previous"
        icon={<ArrowDown className="w-4 h-4" />}
        opacity={prevDown}
        position="bottom"
        accent="border-rule-strong text-ink bg-paper"
      />
    </motion.div>
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
      className={`absolute inline-flex items-center gap-2 px-3 py-1.5 border-2 rounded-md text-[11px] font-bold uppercase tracking-[0.18em] shadow-paper-lift will-change-transform transform-gpu ${accent}`}
      style={{ ...base, transform: composedTransform, opacity }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
