"use client";

import { X } from "lucide-react";
import { CategoryTag } from "./CategoryTag";
import { formatDate } from "@/lib/utils/formatDate";
import { useHapticFeedback } from "@/lib/hooks/useHapticFeedback";

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
    <header className="pointer-events-none relative flex flex-col flex-shrink-0 border-b-2 border-rule/80 bg-paper/60 backdrop-blur-md">
      <div className="pointer-events-none flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="pointer-events-auto flex flex-1 items-center gap-2.5 min-w-0">
          <CategoryTag category={category} />
          <span className="np-dateline hidden sm:inline-block rounded-lg border border-rule/80 bg-paper-2/80 px-2.5 py-1 font-mono text-[11px] font-bold text-ink-soft shadow-2xs">
            {formatDate(publishedAt)}
          </span>
        </div>

        <div className="pointer-events-auto relative z-20 flex flex-shrink-0 items-center gap-2">
          {(onPrev || onNext) && (
            <div className="hidden sm:flex items-center gap-1 border border-rule/80 rounded-lg bg-paper-2/80 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  onPrev?.();
                }}
                disabled={!onPrev}
                className="p-2 text-ink hover:bg-paper rounded-md active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all touch-manipulation min-touch"
                aria-label="Previous story"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 5l-8 7 8 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  onNext?.();
                }}
                disabled={!onNext}
                className="p-2 text-ink hover:bg-paper rounded-md active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all touch-manipulation min-touch"
                aria-label="Next story"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 5l8 7-8 7" />
                </svg>
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              haptic.light();
              onClose();
            }}
            className="tap-target min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl border border-rule/80 bg-paper-2/80 text-ink-soft hover:text-ink hover:bg-paper active:scale-95 transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 shadow-2xs"
            aria-label="Close article"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
