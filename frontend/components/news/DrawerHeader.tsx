'use client';

import { X } from 'lucide-react';
import { CategoryTag } from './CategoryTag';
import { formatDate } from '@/lib/utils/formatDate';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';

interface DrawerHeaderProps {
  category: string;
  publishedAt: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function DrawerHeader({
  category,
  publishedAt,
  onClose,
  onNext,
  onPrev,
}: DrawerHeaderProps) {
  const haptic = useHapticFeedback();

  return (
    <header className="pointer-events-none relative flex flex-col flex-shrink-0 border-b border-rule">
      <div className="pointer-events-none flex items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="pointer-events-auto flex flex-1 items-center gap-2 sm:gap-2.5 min-w-0">
          <CategoryTag category={category} />
          <span className="np-dateline hidden sm:inline rounded-md bg-paper-2 px-2 py-0.5 text-[11px] font-medium text-muted">{formatDate(publishedAt)}</span>
        </div>

        <div className="pointer-events-auto relative z-20 flex flex-shrink-0 items-center gap-1.5">
          {(onPrev || onNext) && (
            <div className="hidden sm:flex items-center gap-1 border border-rule">
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
          <button
            type="button"
            onClick={() => { haptic.light(); onClose(); }}
            className="tap-target min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 text-muted hover:text-ink hover:bg-paper-2 active:scale-90 transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close article"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
