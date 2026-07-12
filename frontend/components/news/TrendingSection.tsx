'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Post } from '@/types';
import { useReadPosts } from '@/lib/utils/readPosts';
import { useI18n } from '@/lib/i18n/context';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { VerificationStamp } from '@/components/ui/VerificationStamp';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';

function YoutubeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M10 9l6 4-6 4z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 6l-7 7 7 7" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 6l7 7-7 7" />
    </svg>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 border border-ink text-ink font-mono text-[10px] sm:text-xs">
      #{rank}
    </span>
  );
}

interface TrendingSectionProps {
  posts: Post[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  const { t } = useI18n();
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
      <section aria-label={t('trending.title')} className="mb-6 sm:mb-10">
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-5">
          <h2 className="font-body font-bold text-base sm:text-xl text-ink">
            {t('trending.title')}
          </h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-body text-[9px] sm:text-[11px] font-bold tracking-wider uppercase text-ink-soft">
              {t('trending.top_count', { n: trending.length })}
            </span>
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => scrollBy('left')}
                disabled={!canScrollLeft}
                className="p-1.5 border border-rule text-muted hover:text-ink disabled:opacity-30 disabled:pointer-events-none transition-all rounded-[4px] min-touch"
                aria-label={t('trending.aria_scroll_left')}
              >
                <ArrowLeft />
              </button>
              <button
                onClick={() => scrollBy('right')}
                disabled={!canScrollRight}
                className="p-1.5 border border-rule text-muted hover:text-ink disabled:opacity-30 disabled:pointer-events-none transition-all rounded-[4px] min-touch"
                aria-label={t('trending.aria_scroll_right')}
              >
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>

      <ErrorBoundary>
        <div
          ref={carouselRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory overscroll-x-contain scroll-smooth no-scrollbar scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {trending.map((post, index) => {
            const read = hydrated && isRead(post.id);
            const rank = index + 1;

            return (
                <div
                  key={post.id}
                  className="flex-shrink-0 w-[80vw] sm:w-[300px] md:w-[315px] snap-start animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    data-read={read ? 'true' : 'false'}
                    className={`ink-card glass-card flex flex-col justify-between h-full p-4 sm:p-5 overflow-hidden w-full max-w-full ${read ? 'opacity-60' : ''}`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <RankBadge rank={rank} />
                          <span className="font-body text-[10px] font-bold tracking-wider uppercase text-ink-soft">
                            {post.category}
                          </span>
                          {post.content_type === 'video' && (
                            <span className="inline-flex items-center gap-1 px-1 py-0.5 border border-ink/15 text-ink-soft font-body text-[9px] font-bold tracking-wider uppercase">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="2" y="5" width="20" height="14" rx="3" />
                                <path d="M10 9l6 4-6 4z" />
                              </svg>
                              {t('card.video')}
                            </span>
                          )}
                        </div>

                        {read && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-rule/80 rounded-full text-[9px] font-medium text-ink-soft/80 bg-paper-2/40">
                            <EyeIcon />
                            {t('card.viewed')}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/news/${post.id}/`}
                        onClick={() => haptic.light()}
                        aria-label={`${post.headline} (Rank ${rank})`}
                      >
                        <p className="font-body font-bold text-[13px] sm:text-[15px] leading-[1.25] text-ink line-clamp-3 mb-3 sm:mb-4">
                          {post.headline}
                        </p>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-rule mt-auto relative z-10">
                      <VerificationStamp score={post.credibility_score} xsmall />
                      <Link
                        href={`/news/${post.id}/`}
                        onClick={() => haptic.light()}
                        className="inline-flex items-center gap-1 font-body text-[11px] text-ink-soft hover:text-ink transition-colors"
                      >
                        {t('card.read_full')} <ArrowRight />
                      </Link>
                    </div>
                  </div>
              </div>
            );
          })}
        </div>
      </ErrorBoundary>
    </section>
  );
}
