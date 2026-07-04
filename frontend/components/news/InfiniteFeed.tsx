'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/types';
import { dedupe } from '@/lib/utils/dedupe';
import { NewsCard } from './NewsCard';
import { NewsDrawer } from './NewsDrawer';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import {
  POLL_INTERVAL_MS,
  DEFAULT_PAGE_SIZE,
} from '@/lib/config/constants';
import { useInfiniteFeed } from '@/lib/hooks/useInfiniteFeed';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';
import { useReadPosts } from '@/lib/utils/readPosts';
import { cn } from '@/lib/utils/cn';

const TICK_THROTTLE_MS = 4_000;

interface InfiniteFeedProps {
  initialPosts: Post[];
  initialCount: number;
  category?: string;
  pageSize?: number;

  excludeIds?: string[];
}

const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.02 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 340, damping: 28, mass: 0.55 },
  },
};

export function InfiniteFeed({
  initialPosts,
  initialCount,
  category,
  pageSize = DEFAULT_PAGE_SIZE,
  excludeIds,
}: InfiniteFeedProps) {

  const { posts, setPosts, loading, exhausted, freshIds, loadMore } = useInfiniteFeed({
    initialPosts,
    initialCount,
    category,
    pageSize,
    excludeIds,
  });


  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {

    const t = window.setTimeout(() => setHasAnimated(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [lastOpenedId, setLastOpenedId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastOpenedId) return;
    const t = window.setTimeout(() => setLastOpenedId(null), 1100);
    return () => window.clearTimeout(t);
  }, [lastOpenedId]);

  const { readIds, markRead } = useReadPosts();

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  const sentinelRef = useIntersectionObserver({
    onIntersect: () => loadMoreRef.current(),
    rootMargin: '800px 0px',
    enabled: !loading && !exhausted
  });

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (!active || !grid.contains(active)) return;

      const cards = Array.from(
        grid.querySelectorAll<HTMLElement>('[role="button"][tabindex="0"]')
      );
      if (cards.length === 0) return;

      const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
      const currentIdx = cards.indexOf(active as HTMLElement);
      if (currentIdx === -1) return;

      let nextIdx = currentIdx;
      switch (e.key) {
        case 'ArrowRight':
          nextIdx = Math.min(currentIdx + 1, cards.length - 1);
          break;
        case 'ArrowLeft':
          nextIdx = Math.max(currentIdx - 1, 0);
          break;
        case 'ArrowDown':
          nextIdx = Math.min(currentIdx + cols, cards.length - 1);
          break;
        case 'ArrowUp':
          nextIdx = Math.max(currentIdx - cols, 0);
          break;
        default:
          return;
      }

      if (nextIdx !== currentIdx) {
        e.preventDefault();
        cards[nextIdx]?.focus();
      }
    };

    grid.addEventListener('keydown', handleKeyDown);
    return () => grid.removeEventListener('keydown', handleKeyDown);
  }, []);


  useEffect(() => {
    if (selectedPost && !posts.find((p) => p.id === selectedPost.id)) {
      setSelectedPost(null);
    }
  }, [posts, selectedPost]);

  const handleOpen = useCallback((post: Post) => {
    markRead(post.id);
    setSelectedPost(post);
  }, [markRead]);

  const readMap = readIds;

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-paper border border-rule flex items-center justify-center mb-5 animate-soft-float shadow-sm">
          <svg
            className="w-7 h-7 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="font-display text-lg font-bold text-ink tracking-[-0.015em] mb-1.5">No verified news found</h3>
        <p className="text-sm text-muted max-w-sm">
          We couldn&apos;t find any articles. Try a different category or check back in a few minutes.
        </p>
      </div>
    );
  }

  return (
    <>
      <ErrorBoundary>
      <motion.div
        ref={gridRef}
        className="feed-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch"
        variants={gridVariants}
        initial={hasAnimated ? false : 'hidden'}
        animate="show"
      >
        <AnimatePresence initial={false}>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={freshIds.has(post.id) ? 'hidden' : false}
              animate="show"
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
              variants={itemVariants}
              layout={false}
              className="feed-card-shell h-full"
            >
              <NewsCard
                post={post}
                onClick={() => handleOpen(post)}
                isNew={freshIds.has(post.id)}
                isRead={readMap.has(post.id)}
                wasRecentlyOpened={lastOpenedId === post.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[218px] rounded-md"
            />
          ))}
        </div>
      )}

      {!exhausted && (
        <div ref={sentinelRef} className="h-12 w-full mt-8" aria-hidden="true" />
      )}

      {exhausted && posts.length > pageSize && (
        <p className="text-center text-xs text-muted mt-12">
          You&apos;ve reached the end — {posts.length} verified stories.
        </p>
      )}
      </ErrorBoundary>

      <NewsDrawer
        post={selectedPost}
        onClose={() => {
          if (selectedPost) setLastOpenedId(selectedPost.id);
          setSelectedPost(null);
        }}
        onSelectRelated={(next) => {
          markRead(next.id);
          setPosts((prev) => (prev.some((p) => p.id === next.id) ? prev : dedupe([next, ...prev])));
          setSelectedPost(next);
        }}
      />

    </>
  );
}
