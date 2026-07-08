'use client';

import { CategoryTag } from './CategoryTag';
import { formatDate } from '@/lib/utils/formatDate';
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
    <header className="pointer-events-none relative flex flex-col flex-shrink-0 border-b border-rule">
      <div className="pointer-events-none flex items-center justify-between gap-2 px-5 py-3 pr-20 sm:px-6 sm:pr-20">
        <div className="pointer-events-auto flex flex-1 items-center gap-2.5 min-w-0">
          <CategoryTag category={category} />
          <span className="np-dateline hidden sm:inline">{formatDate(publishedAt)}</span>
          <div className="hidden min-[380px]:flex items-center gap-1.5 pl-2.5 border-l border-rule">
            <ScoreRing score={score} size={26} strokeWidth={2.5} compact />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted">{score}%</span>
          </div>
        </div>

        <div className="pointer-events-auto relative z-20 flex flex-shrink-0 items-center gap-1.5">
          {(onPrev || onNext) && (
            <div className="flex items-center gap-1 border border-rule">
              <button
                type="button"
                onClick={() => { haptic.light(); onPrev?.(); }}
                disabled={!onPrev}
                className="p-1.5 text-ink hover:bg-paper-2 active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition-all touch-manipulation"
                aria-label="Previous story"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-8 7 8 7" /></svg>
              </button>
              <button
                type="button"
                onClick={() => { haptic.light(); onNext?.(); }}
                disabled={!onNext}
                className="p-1.5 text-ink hover:bg-paper-2 active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition-all touch-manipulation"
                aria-label="Next story"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l8 7-8 7" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
