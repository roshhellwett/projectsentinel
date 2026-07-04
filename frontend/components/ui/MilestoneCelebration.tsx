'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';
import { Target, Flame, Zap, Trophy, Diamond, Crown, Award, type LucideProps } from 'lucide-react';
import type { FC } from 'react';

interface MilestoneCelebrationProps {
  milestone: number | null;
  onDismiss?: () => void;
}

const MILESTONE_MESSAGES: Record<number, { title: string; Icon: FC<LucideProps> }> = {
  5:   { title: 'First 5 stories!', Icon: Target },
  10:  { title: 'Double digits!', Icon: Flame },
  15:  { title: '15 and counting!', Icon: Zap },
  25:  { title: 'Quarter century!', Icon: Trophy },
  50:  { title: '50 stories deep!', Icon: Diamond },
  100: { title: 'Century club!', Icon: Crown },
};


function Particle({ index }: { index: number }) {
  const angle = (index / 12) * 360;
  const distance = 40 + Math.random() * 60;
  const tx = Math.cos((angle * Math.PI) / 180) * distance;
  const ty = Math.sin((angle * Math.PI) / 180) * distance;
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9'];
  const color = colors[index % colors.length];
  const size = 4 + Math.random() * 4;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: '50%',
        top: '50%',
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x: tx, y: ty, scale: 0 }}
      transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut', delay: Math.random() * 0.15 }}
    />
  );
}

export function MilestoneCelebration({ milestone, onDismiss }: MilestoneCelebrationProps) {
  const reducedMotion = useReducedMotion();
  const haptic = useHapticFeedback();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (milestone) {
      setVisible(true);
      haptic.success();
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [milestone, haptic, onDismiss]);

  const msg = milestone ? MILESTONE_MESSAGES[milestone] ?? { title: `${milestone} stories!`, Icon: Award } : null;

  return (
    <AnimatePresence>
      {visible && msg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={reducedMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 400, damping: 22 }}
          className="relative flex items-center gap-3 px-5 py-3 rounded-2xl bg-paper border border-accent/20 shadow-card-lg will-change-transform transform-gpu"
          role="status"
          aria-live="polite"
        >
          {/* Particles */}
          {!reducedMotion && (
            <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => (
                <Particle key={i} index={i} />
              ))}
            </div>
          )}

          {/* Icon badge */}
          <motion.span
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent"
            initial={reducedMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
          >
            <msg.Icon className="w-5 h-5" strokeWidth={2.2} />
          </motion.span>

          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-ink">{msg.title}</span>
            <span className="text-[11px] text-muted font-medium">
              {milestone} stories read today
            </span>
          </div>

          {/* Accent bar */}
          <div
            className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-accent opacity-40"
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
