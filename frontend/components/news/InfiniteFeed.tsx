'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Post } from '@/types';
import { dedupe } from '@/lib/utils/dedupe';
import { NewsCard } from './NewsCard';
import { NewsDrawer } from './NewsDrawer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { DEFAULT_PAGE_SIZE } from '@/lib/config/constants';
import { useInfiniteFeed } from '@/lib/hooks/useInfiniteFeed';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';
import { useReadPosts } from '@/lib/utils/readPosts';
import { useDailyReadCount } from '@/lib/hooks/useDailyReadCount';
import { EngagementCounter } from '@/components/ui/EngagementCounter';
import { MilestoneCelebration } from '@/components/ui/MilestoneCelebration';


const MILESTONE_LABELS: Record<number, string> = {
  5: 'First 5 stories!',
  10: 'Double digits!',
  15: 'Half a dozen more!',
  25: 'A quarter century!',
  50: '50 stories deep!',
  100: 'Century club!',
};

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

interface InfiniteFeedProps {
  initialPosts: Post[];
  initialCount: number;
  category?: string;
  pageSize?: number;
  excludeIds?: string[];
}

export function FeedSkeleton() {
  return (
    <div className="premium-card animate-shimmer h-full flex flex-col p-5 md:p-6 gap-3" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="h-3 w-16 rounded-full bg-rule/60" />
        <div className="h-3 w-12 rounded-full bg-rule/40" />
      </div>
      <div className="space-y-2 mt-2">
        <div className="h-5 w-full rounded bg-rule/50" />
        <div className="h-5 w-3/4 rounded bg-rule/40" />
      </div>
      <div className="space-y-1.5 mt-1">
        <div className="h-3 w-full rounded bg-rule/30" />
        <div className="h-3 w-5/6 rounded bg-rule/30" />
      </div>
      <div className="mt-auto pt-4 border-t border-rule/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-full rounded-full bg-rule/30" />
          <div className="h-3 w-16 rounded bg-rule/30" />
        </div>
        <div className="flex gap-1.5 mt-3">
          <div className="h-6 w-20 rounded bg-rule/30" />
          <div className="h-6 w-16 rounded bg-rule/20" />
        </div>
      </div>
    </div>
  );
}

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

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [lastOpenedId, setLastOpenedId] = useState<string | null>(null);
  const openedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { readIds, markRead } = useReadPosts();
  const { dailyCount, streak, milestone, recordRead } = useDailyReadCount();

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  const sentinelRef = useIntersectionObserver({
    onIntersect: () => loadMoreRef.current(),
    rootMargin: '800px 0px',
    enabled: !loading && !exhausted
  });

  const gridRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback((post: Post) => {
    markRead(post.id);
    recordRead();
    setSelectedPost(post);
  }, [markRead, recordRead]);

  const handleCardKeyDown = useCallback((e: React.KeyboardEvent, post: Post) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLastOpenedId(post.id);
      if (openedTimerRef.current) clearTimeout(openedTimerRef.current);
      openedTimerRef.current = setTimeout(() => {
        openedTimerRef.current = null;
        setLastOpenedId(null);
      }, 1100);
      handleOpen(post);
    }
  }, [handleOpen]);

  const readMap = readIds;
  const readCount = posts.filter((p) => readMap.has(p.id)).length;
  const nextMilestone = [5, 10, 15, 25, 50, 100].find((m) => m > dailyCount) ?? 100;
  const progressPct = Math.min(100, (dailyCount / nextMilestone) * 100);
  const streakLabel = STREAK_MILESTONES.slice().reverse().find((s) => streak >= s);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-paper border border-rule flex items-center justify-center mb-5 shadow-sm">
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <EngagementCounter
          dailyCount={dailyCount}
          streak={streak}
          nextMilestone={nextMilestone}
        />

        {readCount > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto bg-paper-2 px-3 py-1 rounded-full border border-rule/60">
            <span className="text-[11px] font-semibold text-muted tabular-nums whitespace-nowrap">
              <span className="text-ink font-bold">{readCount}</span> / {posts.length} stories read
            </span>
          </div>
        )}
      </div>

      <div className="mb-6 relative z-20">
        <MilestoneCelebration milestone={milestone} />
      </div>

      <motion.div
        ref={gridRef}
        className="feed-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch"
      >
        {posts.map((post, index) => {
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px 0px' }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 28,
                mass: 0.7,
                delay: Math.min(index * 0.03, 0.2),
              }}
              className="feed-card-shell h-full rounded-xl transition-all"
            >
              <NewsCard
                post={post}
                onClick={() => {
                  setLastOpenedId(post.id);
                  if (openedTimerRef.current) clearTimeout(openedTimerRef.current);
                  openedTimerRef.current = setTimeout(() => {
                    openedTimerRef.current = null;
                    setLastOpenedId(null);
                  }, 1100);
                  handleOpen(post);
                }}
                isNew={freshIds.has(post.id)}
                isRead={readMap.has(post.id)}
                wasRecentlyOpened={lastOpenedId === post.id}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={`skeleton-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <FeedSkeleton />
            </motion.div>
          ))}
        </div>
      )}

      {!exhausted && (
        <div ref={sentinelRef} className="h-12 w-full mt-8" aria-hidden="true" />
      )}

      {exhausted && posts.length > pageSize && (
        <p className="text-center text-xs text-muted mt-12">
          {readCount}/{posts.length} stories read &middot; you&apos;ve reached the end.
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
          recordRead();
          setPosts((prev) => (prev.some((p) => p.id === next.id) ? prev : dedupe([next, ...prev])));
          setSelectedPost(next);
        }}
        onNext={() => {
          if (!selectedPost) return;
          const idx = posts.findIndex((p) => p.id === selectedPost.id);
          if (idx !== -1 && idx < posts.length - 1) {
            const next = posts[idx + 1];
            markRead(next.id);
            recordRead();
            setSelectedPost(next);
          }
        }}
        onPrev={() => {
          if (!selectedPost) return;
          const idx = posts.findIndex((p) => p.id === selectedPost.id);
          if (idx > 0) {
            const prev = posts[idx - 1];
            markRead(prev.id);
            recordRead();
            setSelectedPost(prev);
          }
        }}
      />

    </>
  );
}
