'use client';

import { useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';
import { useI18n } from '@/lib/i18n/i18n-shared';
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

function Particle({ index, tx, ty, color, size, duration, delay }: {
  index: number;
  tx: number;
  ty: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
}) {
  return (
    <div
      className="absolute rounded-full animate-particle-burst"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: '50%',
        top: '50%',
        marginLeft: -size / 2,
        marginTop: -size / 2,
        ['--tx' as string]: `${tx}px`,
        ['--ty' as string]: `${ty}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export function MilestoneCelebration({ milestone, onDismiss }: MilestoneCelebrationProps) {
  const { t } = useI18n();
  const haptic = useHapticFeedback();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => { reducedMotionRef.current = e.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (milestone) {
      setVisible(true);
      setExiting(false);
      haptic.success();
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setVisible(false);
          onDismiss?.();
        }, 250);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [milestone, haptic, onDismiss]);

  const msg = milestone ? MILESTONE_MESSAGES[milestone] ?? { title: `${milestone} stories!`, Icon: Award } : null;

  const particlesRef = useRef<Array<{ tx: number; ty: number; color: string; size: number; duration: number; delay: number }>>(null);
  if (!particlesRef.current) {
    const colors = ['#0057b3', '#008a5e', '#b8860b', '#c41e3a', '#0ea5e9', '#f59e0b'];
    particlesRef.current = Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * 360;
      const distance = 40 + Math.random() * 60;
      return {
        tx: Math.cos((angle * Math.PI) / 180) * distance,
        ty: Math.sin((angle * Math.PI) / 180) * distance,
        color: colors[i % colors.length],
        size: 4 + Math.random() * 4,
        duration: 0.8 + Math.random() * 0.4,
        delay: Math.random() * 0.15,
      };
    });
  }

  if (!visible || !msg) return null;

  return (
    <>
      <style>{`
        @keyframes celebrate-in {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes celebrate-out {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.9) translateY(-10px); }
        }
        @keyframes particle-burst {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx, 0), var(--ty, 0)) scale(0); }
        }
        @keyframes icon-pop {
          0% { transform: scale(0); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-celebrate-in,
          .animate-celebrate-out,
          .animate-particle-burst,
          .animate-icon-pop {
            animation: none !important;
          }
        }
      `}</style>
      <div
        className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl bg-paper border border-accent/20 shadow-card-lg will-change-transform transform-gpu ${
          exiting ? 'animate-celebrate-out' : 'animate-celebrate-in'
        }`}
        role="status"
        aria-live="polite"
      >
        {!reducedMotionRef.current && (
          <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
            {particlesRef.current.map((p, i) => (
              <Particle key={i} index={i} {...p} />
            ))}
          </div>
        )}

        <span
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent animate-icon-pop"
        >
          <msg.Icon className="w-5 h-5" strokeWidth={2.2} />
        </span>

        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-ink">{msg.title}</span>
          <span className="text-[11px] text-muted font-medium">
            {milestone} {t('feed.stories_read')} {t('common.today')}
          </span>
        </div>

        <div
          className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-accent opacity-40"
          aria-hidden="true"
        />
      </div>
    </>
  );
}
