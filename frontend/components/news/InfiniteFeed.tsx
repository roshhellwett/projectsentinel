'use client';

import { useState, useRef, useCallback, useMemo, memo } from 'react';
import { Post } from '@/types';
import { cn } from '@/lib/utils/cn';
import { dedupe } from '@/lib/utils/dedupe';
import { NewsCard } from './NewsCard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { DEFAULT_PAGE_SIZE } from '@/lib/config/constants';
import { useInfiniteFeed } from '@/lib/hooks/useInfiniteFeed';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';
import { useReadPosts } from '@/lib/utils/readPosts';
import { useDailyReadCount } from '@/lib/hooks/useDailyReadCount';
import { useI18n } from '@/lib/i18n/i18n-shared';
import dynamic from 'next/dynamic';

const NewsDrawer = dynamic(() => import('./NewsDrawer').then(m => m.NewsDrawer), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-paper z-50 animate-fade-in" aria-hidden="true" />,
});

interface InfiniteFeedProps {
  initialPosts: Post[];
  hasInitialMore: boolean;
  category?: string;
  pageSize?: number;
  excludeIds?: string[];
}

export function FeedSkeleton() {
  return (
    <div className="animate-shimmer h-full flex flex-col p-5 md:p-6 gap-3 overflow-hidden border border-rule bg-paper-2 rounded-[6px]" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="h-3 w-16 bg-rule/60 border border-rule" />
        <div className="h-3 w-12 bg-rule/40 border border-rule" />
      </div>
      <div className="space-y-2 mt-2">
        <div className="h-5 w-full bg-rule/50 border border-rule" />
        <div className="h-5 w-3/4 bg-rule/40 border border-rule" />
      </div>
      <div className="space-y-1.5 mt-1">
        <div className="h-3 w-full bg-rule/30 border border-rule" />
        <div className="h-3 w-5/6 bg-rule/30 border border-rule" />
      </div>
      <div className="mt-auto pt-4 border-t border-rule/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-full bg-rule/30 border border-rule" />
        </div>
      </div>
    </div>
  );
}

const FeedItem = memo(function FeedItem({
  post,
  index,
  isNew,
  isRead,
  onCardClick,
}: {
  post: Post;
  index: number;
  isNew: boolean;
  isRead: boolean;
  onCardClick: (post: Post) => void;
}) {
  const handleClick = useCallback(() => {
    onCardClick(post);
  }, [onCardClick, post]);

  const content = (
    <NewsCard
      post={post}
      onClick={handleClick}
      isNew={isNew}
      isRead={isRead}
    />
  );

  return (
    <div
      className={cn(
        'h-full transition-opacity duration-200 select-none touch-manipulation',
        index < 6 && 'animate-slide-up'
      )}
      style={index < 6 ? { animationDelay: `${Math.min(index, 4) * 0.03}s` } : undefined}
    >
      {content}
    </div>
  );
});

export function InfiniteFeed({
  initialPosts,
  hasInitialMore,
  category,
  pageSize = DEFAULT_PAGE_SIZE,
  excludeIds,
}: InfiniteFeedProps) {

  const { posts, setPosts, loading, exhausted, freshIds, loadMore } = useInfiniteFeed({
    initialPosts,
    hasInitialMore,
    category,
    pageSize,
    excludeIds,
  });

  const { t } = useI18n();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { readIds, markRead } = useReadPosts();
  const { dailyCount, streak, milestone, recordRead } = useDailyReadCount();

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  const sentinelRef = useIntersectionObserver({
    onIntersect: () => loadMoreRef.current(),
    rootMargin: '400px 0px',
    enabled: !loading && !exhausted
  });

  const gridRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback((post: Post) => {
    markRead(post.id);
    recordRead();
    setSelectedPost(post);
  }, [markRead, recordRead]);

  const handleCardClick = useCallback((post: Post) => {
    handleOpen(post);
  }, [handleOpen]);

  const handleCardClickRef = useRef(handleCardClick);
  handleCardClickRef.current = handleCardClick;

  const stableOnCardClick = useCallback((post: Post) => {
    handleCardClickRef.current(post);
  }, []);

  const readMap = readIds;
  const readCount = useMemo(() => posts.filter((p) => readMap.has(p.id)).length, [posts, readMap]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-24 px-4 text-center">
        <svg className="w-8 h-8 sm:w-12 sm:h-12 text-muted mb-2 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <h3 className="font-body font-bold text-sm sm:text-lg text-ink mb-1">{t('feed.no_news_title')}</h3>
        <p className="font-body text-xs sm:text-sm text-ink-soft max-w-sm">
          {t('feed.no_news_desc')}
        </p>
      </div>
    );
  }

  return (
    <>
      <ErrorBoundary>
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-6">
          <span className="font-body text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-ink-soft">
            {dailyCount} read today
          </span>
          {readCount > 0 && (
            <span className="font-body text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-ink-soft">
              {readCount} / {posts.length} read
            </span>
          )}
        </div>

          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-stretch touch-pan-y"
          >
          {posts.map((post, index) => (
            <FeedItem
              key={post.id}
              post={post}
              index={index}
              isNew={freshIds.has(post.id)}
              isRead={readMap.has(post.id)}
              onCardClick={stableOnCardClick}
            />
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <FeedSkeleton />
              </div>
            ))}
          </div>
        )}

        {!exhausted && (
          <div ref={sentinelRef} className="h-12 w-full mt-8" aria-hidden="true" />
        )}

        {exhausted && posts.length > pageSize && (
          <p className="text-center font-body text-xs text-ink-soft mt-12">
            {readCount}/{posts.length} {t('feed.stories_read')} · {t('feed.reached_end')}
          </p>
        )}
      </ErrorBoundary>

      <NewsDrawer
        post={selectedPost}
        onClose={() => {
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
