'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Post } from '@/types';
import { ScoreRing } from './ScoreRing';
import { CategoryIcon } from './CategoryIcon';
import { useReadPosts } from '@/lib/utils/readPosts';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { getCategoryTheme } from '@/lib/theme/categoryTheme';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';

interface TrendingSectionProps {
  posts: Post[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  const haptic = useHapticFeedback();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const trending = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    return posts.slice(0, 6);
  }, [posts]);

  const { isRead } = useReadPosts();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const canScrollLeftRef = useRef(false);
  const canScrollRightRef = useRef(true);
  const tickingRef = useRef(false);

  const updateScrollState = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    requestAnimationFrame(() => {
      const el = carouselRef.current;
      if (el) {
        const left = el.scrollLeft > 8;
        const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 8;
        if (left !== canScrollLeftRef.current) {
          canScrollLeftRef.current = left;
          setCanScrollLeft(left);
        }
        if (right !== canScrollRightRef.current) {
          canScrollRightRef.current = right;
          setCanScrollRight(right);
        }
      }
      tickingRef.current = false;
    });
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -320 : 320;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  if (trending.length === 0) return null;

  return (
    <section aria-label="Trending stories" className="mb-10">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="flex items-center gap-2.5 font-display text-lg sm:text-xl font-bold text-ink">
          <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-like/10 text-like">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
          </span>
          <span>Trending Stories</span>
        </h2>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-[0.12em]">
            <Sparkles className="w-3.5 h-3.5 text-streak" strokeWidth={2} />
            <span>Top {trending.length} verified</span>
          </span>
          {/* Desktop navigation arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scrollBy('left')}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-lg border border-rule/60 text-muted hover:text-ink hover:border-rule-strong disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 hover:bg-paper-2"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollBy('right')}
              disabled={!canScrollRight}
              className="p-1.5 rounded-lg border border-rule/60 text-muted hover:text-ink hover:border-rule-strong disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 hover:bg-paper-2"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ErrorBoundary>
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory overscroll-x-contain scroll-smooth no-scrollbar scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {trending.map((post, index) => {
            const read = hydrated && isRead(post.id);
            const rank = index + 1;
            const theme = getCategoryTheme(post.category);

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px 0px' }}
                transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex-shrink-0 w-[275px] sm:w-[315px] snap-start"
              >
                <Link
                  href={`/news/${post.id}/`}
                  onClick={() => haptic.light()}
                  data-read={read ? 'true' : 'false'}
                  className={`group relative ${Z_INDEX.content} flex flex-col justify-between h-full p-5 rounded-2xl bg-paper border border-rule/60 shadow-card hover:shadow-card-lg hover:border-accent/30 transition-[box-shadow,border-color,transform] duration-300 overflow-hidden w-full max-w-full ${read ? 'opacity-60 saturate-[0.75]' : ''}`}
                  aria-label={`${post.headline} (Rank ${rank})`}
                >
                  {/* Category accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-300 group-hover:h-1"
                    style={{ background: theme.cssGradient }}
                    aria-hidden="true"
                  />

                  {/* Hover gradient glow */}
                  <div className="card-hover-glow" aria-hidden="true" />

                  {/* Huge watermark rank number */}
                  <span
                    className="absolute -right-2 -bottom-4 font-display font-black text-[80px] sm:text-[96px] leading-none text-ink/[0.04] dark:text-ink/[0.06] select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
                    aria-hidden="true"
                  >
                    {String(rank).padStart(2, '0')}
                  </span>

                  <div className="relative z-10">
                    {/* Top Row: Rank badge + Category pill */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-ink text-paper font-mono text-[11px] font-bold shadow-sm">
                          #{rank}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border"
                          style={theme.pill}
                        >
                          <CategoryIcon name={theme.icon} className="w-2.5 h-2.5" strokeWidth={2.2} aria-hidden="true" />
                          <span>{theme.label}</span>
                        </span>
                      </div>

                      {read && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cred-high bg-cred-high/10 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" strokeWidth={3} />
                          Read
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <p className="font-display font-bold text-[15px] sm:text-[16px] leading-[1.25] text-ink line-clamp-3 mb-4 group-hover:text-accent transition-colors duration-250">
                      {post.headline}
                    </p>
                  </div>

                  {/* Bottom Row: Score Ring + CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-rule/50 mt-auto relative z-10">
                    <div className="flex items-center gap-2">
                      <ScoreRing score={post.credibility_score} size={32} strokeWidth={2.8} compact />
                      <span className="text-[10px] font-bold text-muted uppercase tracking-[0.1em]">verified</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-accent group-hover:translate-x-1 transition-transform duration-300">
                      <span>Read</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </ErrorBoundary>
    </section>
  );
}
