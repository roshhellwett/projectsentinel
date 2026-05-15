'use client';

/**
 * ReadingProgress — slim accent-coloured bar pinned to the top of the
 * viewport that fills as the user scrolls through an article.
 *
 * Implementation notes:
 *   • A single `transform: scaleX(...)` keeps this layer cheap — no layout
 *     reflows, just a GPU-composited transform on every rAF tick.
 *   • Listens with `{ passive: true }` and rAF-guards to stay buttery on
 *     low-end Android.
 *   • Hidden when `prefers-reduced-motion` to respect user prefs.
 *   • Only renders progress between 1% and 99% — at the absolute top the
 *     bar is invisible, and once you've finished scrolling it fades out so
 *     it doesn't draw attention while you read the closing paragraphs.
 */

import { useEffect, useRef, useState } from 'react';

interface ReadingProgressProps {
  /**
   * Selector or ref for the article content. If omitted, progress is
   * measured against the full document height which works fine for the
   * news article layout.
   */
  targetSelector?: string;
}

export function ReadingProgress({ targetSelector }: ReadingProgressProps = {}) {
  const [progress, setProgress] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const compute = () => {
      const target = targetSelector
        ? document.querySelector(targetSelector) as HTMLElement | null
        : null;

      const scrolled = window.scrollY;
      let total: number;

      if (target) {
        const rect = target.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        const elementHeight = rect.height;
        const viewport = window.innerHeight;
        total = Math.max(1, elementHeight + elementTop - viewport);
      } else {
        total = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight,
        );
      }

      const ratio = Math.max(0, Math.min(1, scrolled / total));
      setProgress(ratio);
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(() => {
        compute();
        tickingRef.current = false;
      });
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [targetSelector]);

  // Hide entirely when not actively reading (top of page or finished).
  const visible = progress > 0.005 && progress < 0.995;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 z-[54] h-[2px] pointer-events-none"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 4rem)' }}
    >
      <div
        className="h-full origin-left transition-opacity duration-400"
        style={{
          transform: `scaleX(${progress})`,
          opacity: visible ? 1 : 0,
          background: 'linear-gradient(to right, #8b7ff0, #a08cdc, #8b7ff0)',
          boxShadow: '0 0 12px rgba(139, 127, 240, 0.55)',
          willChange: 'transform, opacity',
          transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  );
}
