'use client';

/**
 * LiveUpdateIsland — iOS Dynamic-Island-style live notification.
 *
 * Behaviour
 * ─────────
 *  • Pinned at top-center of the viewport, just below the fixed navbar.
 *  • Stays out of sight until at least one pending new post is queued.
 *  • Animates in from a small pinhole (scale + width spring) to match the
 *    physical-feel rhythm of Apple's Dynamic Island reveal.
 *  • Counts up gracefully when more posts arrive while the island is shown.
 *  • Tapping it dispatches an onReveal() callback (caller is expected to
 *    flush the pending list into the feed and smooth-scroll to top).
 *  • Auto-dismisses itself when the user scrolls back near the top.
 *  • Respects prefers-reduced-motion via the global media query in
 *    globals.css; framer-motion picks that up automatically.
 *
 * Engineering notes
 * ─────────────────
 *  • The component is purely presentational — it owns no pending-post
 *    state. The parent (InfiniteFeed) decides when to queue vs. when to
 *    prepend immediately, so the rhythm of the rest of the system never
 *    breaks.
 *  • Click target is large enough for thumbs (min-height 44px on mobile).
 *  • Live-region announces count changes to screen readers.
 *  • When any modal/drawer/search overlay is open, the island hides via the
 *    shared scroll-lock subscriber so it never floats above an active dialog.
 *  • At rest (no pending posts) the component renders a zero-cost wrapper.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Post } from '@/types';
import { subscribeBodyScrollLock, isBodyScrollLocked } from '@/lib/utils/bodyScrollLock';

interface LiveUpdateIslandProps {
  /** Posts queued for prepend. Empty array = island hidden. */
  pending: Post[];
  /**
   * Called when the user taps the island.
   *
   * The parent receives the newest queued post (i.e. `pending[0]`) so it
   * can open that specific story in the drawer — matching the iOS-Dynamic-
   * Island mental model of "tap the notification, jump to that thing". The
   * parent is also responsible for clearing the queue and marking every
   * acknowledged ID as already-seen so the same post never bubbles back up
   * on the next poll tick.
   */
  onTap: (newest: Post) => void;
}

/**
 * Hide the island once the user is back near the top. Aligned with
 * `AUTO_FLUSH_AT_SCROLL_Y` in InfiniteFeed so the island fades out at the
 * exact instant pending posts are silently prepended — no deadband where
 * the island is gone but the new headlines are still invisible.
 */
const HIDE_AT_SCROLL_Y = 140;

export function LiveUpdateIsland({ pending, onTap }: LiveUpdateIslandProps) {
  const [nearTop, setNearTop] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Track whether the user is near the top so we can auto-hide the island.
  // Uses a single rAF guard to avoid layout thrash during fast scrolls.
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setNearTop(window.scrollY < HIDE_AT_SCROLL_Y);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hide the island when any modal/drawer/search overlay is open. Any of those
  // could be at z-50/z-100; the island at z-55 would visually float above them
  // which breaks the hierarchy. By reacting to the shared scroll-lock counter
  // we stay coordinated with the rest of the UI.
  useEffect(() => {
    setOverlayOpen(isBodyScrollLocked());
    return subscribeBodyScrollLock(setOverlayOpen);
  }, []);

  const count = pending.length;
  const visible = count > 0 && !nearTop && !overlayOpen;
  const previewHeadline = pending[0]?.headline ?? '';

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 z-[55] flex justify-center px-3"
      style={{
        // Sits ~12px below the navbar (h-16 mobile, h-[68px] desktop).
        // env() gracefully falls back to 0 on non-iOS browsers.
        top: 'calc(env(safe-area-inset-top, 0px) + 4.75rem)',
      }}
    >
      <AnimatePresence>
        {visible && (
          <motion.button
            type="button"
            key="live-island"
            onClick={() => {
              const newest = pending[0];
              if (newest) onTap(newest);
            }}
            // Pinhole-grow reveal — width and scale spring from a near-zero
            // origin to give the unmistakable Dynamic Island feel.
            initial={{ opacity: 0, scale: 0.55, y: -12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.6, y: -10, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 360, damping: 28, mass: 0.7 }}
            whileHover={{ y: 1, scale: 1.015 }}
            whileTap={{ scale: 0.965 }}
            aria-label={`${count} new ${count === 1 ? 'story' : 'stories'} — tap to view`}
            className="
              pointer-events-auto group
              relative flex items-center gap-3
              max-w-[min(92vw,30rem)]
              pl-3 pr-4 py-2
              rounded-full
              text-white
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
              live-island-shell
            "
          >
            {/* Left badge: pulsing dot + count chip */}
            <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.10] flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-accent/45 blur-[6px]" aria-hidden="true" />
              <span className="relative flex items-center justify-center">
                <span className="absolute w-2.5 h-2.5 rounded-full bg-accent/80 animate-ping" aria-hidden="true" />
                <span className="relative w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(139,127,240,0.9)]" />
              </span>
            </span>

            {/* Body: count + preview headline */}
            <span className="flex flex-col items-start min-w-0 leading-tight">
              <motion.span
                key={count}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                className="text-[12px] font-semibold tracking-wide text-white/95 uppercase letter-spacing-wide"
              >
                {count} New {count === 1 ? 'Story' : 'Stories'}
              </motion.span>
              <span className="text-[12.5px] text-white/70 truncate max-w-[min(74vw,22rem)] font-normal normal-case">
                {previewHeadline}
              </span>
            </span>

            {/* Trailing arrow — subtle nudge upward on hover */}
            <motion.span
              className="flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.10] flex-shrink-0 ml-auto"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.4} />
            </motion.span>

            {/* Specular sheen — engraved-coin highlight along the top edge */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-3 top-[1px] h-[1px] rounded-full bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
