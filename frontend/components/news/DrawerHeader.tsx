'use client';

import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  onClose,
  score = 92,
  onNext,
  onPrev,
}: DrawerHeaderProps) {
  const theme = getCategoryTheme(category);
  const haptic = useHapticFeedback();

  return (
    <header className={`relative ${Z_INDEX.content} flex flex-col rounded-t-none bg-paper border-b border-rule/50 flex-shrink-0 sm:px-6 lg:rounded-none lg:px-7`}>
      {/* Gradient Category Header Bar across exact top */}
      <div
        className="w-full h-[3px] flex-shrink-0 transition-all duration-500"
        style={{ background: theme.cssGradient, boxShadow: `0 1px 8px ${theme.gradientFrom}33` }}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <CategoryTag category={category} />
          <span className="text-xs text-muted truncate font-medium hidden sm:inline">{formatDate(publishedAt)}</span>

          {/* Circular Reading/Credibility Progress Ring */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-rule/60">
            <ScoreRing score={score} size={30} strokeWidth={2.8} compact />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Verified</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Swipe / Story Navigation Buttons */}
          {(onPrev || onNext) && (
            <div className="flex items-center gap-1 mr-2 bg-paper-2/80 p-1 rounded-xl border border-rule/50 shadow-sm backdrop-blur-sm">
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={() => { haptic.light(); onPrev?.(); }}
                disabled={!onPrev}
                className="p-1.5 rounded-lg text-ink hover:bg-paper disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous story"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={() => { haptic.light(); onNext?.(); }}
                disabled={!onNext}
                className="p-1.5 rounded-lg text-ink hover:bg-paper disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next story"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => { haptic.light(); onClose(); }}
            className="tap-target min-w-[44px] min-h-[44px] p-2 hover:bg-paper-2 rounded-xl border border-transparent hover:border-rule transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent flex-shrink-0 flex items-center justify-center"
            aria-label="Close article"
          >
            <X className="w-5 h-5 text-muted hover:text-ink transition-colors" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
