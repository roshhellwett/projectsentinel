'use client';

// last edited 2026-05-17 by roshhellwett

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Post } from '@/types';
import { subscribeBodyScrollLock, isBodyScrollLocked } from '@/lib/utils/bodyScrollLock';

interface LiveUpdateIslandProps {

  pending: Post[];

  onTap: (newest: Post) => void;
}

const HIDE_AT_SCROLL_Y = 140;

export function LiveUpdateIsland({ pending, onTap }: LiveUpdateIslandProps) {
  const [nearTop, setNearTop] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false);



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


            initial={{ opacity: 0, scale: 0.55, y: -12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.6, y: -10, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 340, damping: 26, mass: 0.75 }}
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

            <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.10] flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-accent/45 blur-[6px]" aria-hidden="true" />
              <span className="relative flex items-center justify-center">
                <span className="absolute w-2.5 h-2.5 rounded-full bg-accent/80 animate-ping" aria-hidden="true" />
                <span className="relative w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(139,127,240,0.9)]" />
              </span>
            </span>


            <span className="flex flex-col items-start min-w-0 leading-tight">
              <motion.span
                key={count}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                className="text-[12px] font-semibold tracking-normal text-white/95 uppercase"
              >
                {count} New {count === 1 ? 'Story' : 'Stories'}
              </motion.span>
              <span className="text-[12.5px] text-white/70 truncate max-w-[min(74vw,22rem)] font-normal normal-case">
                {previewHeadline}
              </span>
            </span>


            <motion.span
              className="flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.10] flex-shrink-0 ml-auto"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.4} />
            </motion.span>


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
