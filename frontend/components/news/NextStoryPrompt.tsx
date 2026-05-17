'use client';

// last edited 2026-05-17 by roshhellwett

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';

interface NextStoryPromptProps {
  posts: Post[];
  currentPostId: string;
  triggerSelector?: string;
}

export function NextStoryPrompt({ posts, currentPostId, triggerSelector = '#article-body' }: NextStoryPromptProps) {
  const next = posts.find((p) => p.id !== currentPostId);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!next) return;
    const trigger = document.querySelector(triggerSelector);
    if (!trigger) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const rect = (trigger as HTMLElement).getBoundingClientRect();
        const viewport = window.innerHeight || document.documentElement.clientHeight;
        const passed = rect.bottom < viewport * 0.85;
        setVisible(passed);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [next, triggerSelector]);

  if (!next) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="next-story"
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.85 }}
          className="fixed left-1/2 -translate-x-1/2 z-[58] w-[min(94vw,32rem)]"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)' }}
        >
          <Link
            href={`/news/${next.id}/`}
            className="touch-polish group relative flex items-center gap-3 rounded-2xl border border-slate-950/[0.10] bg-white/92 backdrop-blur-2xl px-4 py-3 shadow-[0_28px_70px_-32px_rgba(15,23,42,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <span aria-hidden="true" className="absolute inset-x-3 top-[1px] h-px rounded-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CategoryTag category={next.category} />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Up next</span>
              </div>
              <p className="text-[13.5px] font-semibold text-slate-950 line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                {next.headline}
              </p>
            </div>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/12 border border-accent/30 text-accent flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:bg-accent group-hover:text-white">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
