'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CategoryTag } from './CategoryTag';
import { formatDate } from '@/lib/utils/formatDate';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { getCategoryTheme } from '@/lib/theme/categoryTheme';
import { ScoreRing } from './ScoreRing';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';

interface DrawerHeaderProps {
  category: string;
  publishedAt: string;
  onClose: () => void;
  score?: number;
  onNext?: () => void;
  onPrev?: () => void;
}

export function DrawerHeader({
  category,
  publishedAt,
  score = 92,
  onNext,
  onPrev,
}: DrawerHeaderProps) {
  const theme = getCategoryTheme(category);
  const haptic = useHapticFeedback();

  return (
    <header className={`pointer-events-none relative ${Z_INDEX.content} flex flex-col rounded-t-none bg-transparent border-b border-white/30 dark:border-white/10 flex-shrink-0 sm:px-6 lg:rounded-none lg:px-7`}>
      {/* Gradient Category Header Bar across exact top */}
      <div
        className="pointer-events-none w-full h-[3px] flex-shrink-0 transition-opacity duration-300 transform-gpu"
        style={{ background: theme.cssGradient, boxShadow: `0 1px 8px ${theme.gradientFrom}33` }}
        aria-hidden="true"
      />

      <div className="pointer-events-none flex items-center justify-between gap-2 px-5 py-3.5 pr-20 sm:px-6 sm:pr-20">
        <div className="pointer-events-auto flex flex-1 items-center gap-2 min-w-0">
          <CategoryTag category={category} />
          <span className="text-xs text-muted truncate font-medium hidden sm:inline">{formatDate(publishedAt)}</span>

          {/* Circular Reading/Credibility Progress Ring */}
          <div className="hidden min-[380px]:flex items-center gap-1.5 pl-2 border-l border-rule/60">
            <ScoreRing score={score} size={30} strokeWidth={2.8} compact />
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-muted">Verified</span>
          </div>
        </div>

        <div className="pointer-events-auto relative z-20 flex flex-shrink-0 items-center gap-1.5">
          {/* Swipe / Story Navigation Buttons */}
          {(onPrev || onNext) && (
            <div className="flex items-center gap-1 bg-[#f2f0eb] dark:bg-[#1c1c28] md:bg-paper-2/60 md:dark:bg-paper-tint/40 p-1 rounded-xl border border-rule/40 shadow-sm md:backdrop-blur-xl select-none">
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={() => { haptic.light(); onPrev?.(); }}
                disabled={!onPrev}
                className="p-1.5 rounded-lg text-ink hover:bg-paper disabled:opacity-30 disabled:pointer-events-none transition-colors touch-action-manipulation"
                aria-label="Previous story"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={() => { haptic.light(); onNext?.(); }}
                disabled={!onNext}
                className="p-1.5 rounded-lg text-ink hover:bg-paper disabled:opacity-30 disabled:pointer-events-none transition-colors touch-action-manipulation"
                aria-label="Next story"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
