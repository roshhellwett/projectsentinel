'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Post } from '@/types';
import { SwipeCard, type SwipeDirection } from './SwipeCard';
import { SwipeOverlay } from './SwipeOverlay';
import { SwipeProgress } from './SwipeProgress';
import dynamic from 'next/dynamic';
import { SwipeHint } from './SwipeHint';
import { SwipeEmptyState } from './SwipeEmptyState';

const NewsDrawer = dynamic(() => import('@/components/news/NewsDrawer').then(m => m.NewsDrawer), { ssr: false });
const SwipeBreakPrompt = dynamic(() => import('./SwipeBreakPrompt').then(m => m.SwipeBreakPrompt), { ssr: false });
import { useSwipeQueue } from '@/lib/hooks/useSwipeQueue';
import { useReadPosts, useSavedPosts } from '@/lib/utils/readPosts';
import { markSeen } from '@/lib/utils/seenSet';
import { snoozeBreakToday } from '@/lib/utils/swipeStats';
import { useSwipeTracking } from '@/lib/hooks/useSwipeTracking';

const BREAK_PROMPT_AT = 25;
const UNDO_TOAST_MS = 3500;

interface SwipeStackProps {
  initialPosts: Post[];
}

export function SwipeStack({ initialPosts }: SwipeStackProps) {
  const { readIds, markRead } = useReadPosts();
  const { save: saveBookmark, unsave: unsaveBookmark } = useSavedPosts();

  const queue = useSwipeQueue({
    initialPosts,
    excludeReadIds: readIds,
    hideRead: true,
  });

  const [drag, setDrag] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastDragRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [drawerPost, setDrawerPost] = useState<Post | null>(null);
  const { stats, showBreak, setShowBreak, trackSwipe, sessionCards } = useSwipeTracking();

  const handleDragProgress = useCallback((newDrag: { x: number; y: number }) => {
    if (newDrag.x === 0 && newDrag.y === 0) {
      lastDragRef.current = { x: 0, y: 0 };
      setDrag({ x: 0, y: 0 });
      return;
    }
    const dx = Math.abs(newDrag.x - lastDragRef.current.x);
    const dy = Math.abs(newDrag.y - lastDragRef.current.y);
    if (dx > 3 || dy > 3) {
      lastDragRef.current = newDrag;
      setDrag(newDrag);
    }
  }, []);

  const queueRef = useRef(queue);
  queueRef.current = queue;

  const handleSwipe = useCallback(
    (direction: SwipeDirection, post: Post) => {
      const q = queueRef.current;
      if (direction === 'down' || direction === 'left') {
        q.rewind();
        lastDragRef.current = { x: 0, y: 0 };
        setDrag({ x: 0, y: 0 });
        return;
      }

      markSeen(post.id);
      trackSwipe(post);

      q.advance(post, direction, false);
      lastDragRef.current = { x: 0, y: 0 };
      setDrag({ x: 0, y: 0 });
    },
    [trackSwipe],
  );

  const handleTap = useCallback(
    (post: Post) => {
      markRead(post.id);
      setDrawerPost(post);
    },
    [markRead],
  );

  const handleRewindButton = useCallback(() => {
    queueRef.current.rewind();
  }, []);

  const { current, next, upcoming } = queue;
  const visible = useMemo(
    () => [current, next, upcoming].filter(Boolean) as Post[],
    [current, next, upcoming],
  );

  const drawerPostRef = useRef(drawerPost);
  const showBreakRef = useRef(showBreak);
  const handleSwipeRef = useRef(handleSwipe);

  useEffect(() => {
    drawerPostRef.current = drawerPost;
    showBreakRef.current = showBreak;
    handleSwipeRef.current = handleSwipe;
  }, [drawerPost, showBreak, handleSwipe]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const cur = queueRef.current.current;
      if (!cur || drawerPostRef.current || showBreakRef.current) return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.closest('a, button, [role="button"]:not([data-swipe-card])'))) return;

      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipeRef.current(e.key === 'ArrowRight' ? 'right' : 'up', cur);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        if (queueRef.current.canRewind) {
          e.preventDefault();
          handleSwipeRef.current('left', cur);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (queue.isExhausted) {
    return (
      <SwipeEmptyState
        cardsToday={stats.cardsToday}
        uniqueHostsToday={stats.uniqueHostsToday}
        streak={stats.streak}
        onRefresh={() => queue.retry()}
        isFetching={queue.isFetching}
      />
    );
  }

  if (visible.length === 0 && queue.hasError) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-10 text-center">
        <span className="block w-12 h-[2px] bg-accent mx-auto mb-5" aria-hidden="true" />
        <h2 className="font-display text-2xl font-bold text-ink mb-2">Couldn&apos;t load stories</h2>
        <p className="text-[13px] text-muted mb-6">
          We&apos;re having trouble reaching the server. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => queue.retry()}
          disabled={queue.isFetching}
          className="tap-target min-h-[44px] px-4 pt-[9px] pb-[11px] bg-ink text-paper text-[13px] font-semibold rounded hover:bg-ink/90 transition-all hover-lift disabled:opacity-60 disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {queue.isFetching ? 'Retrying…' : 'Try again'}
        </button>
      </div>
    );
  }

  if (visible.length === 0) {

    return (
      <div className="w-full max-w-md mx-auto px-4 py-10">
        <div className="h-72 rounded-md border border-rule bg-paper-2 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <SwipeProgress
        consumedToday={stats.cardsToday}
        remaining={queue.remaining}
        streak={stats.streak}
        canRewind={queue.canRewind}
        onRewind={handleRewindButton}
      />

      <div className="relative w-full overscroll-x-contain">
        <div className="relative grid w-full max-w-md mx-auto px-4 [&>*]:[grid-area:1/1]">
          <AnimatePresence mode="popLayout">
            {visible
              .slice()
              .reverse()
              .map((post, i) => {
                const depth = (visible.length - 1 - i) as 0 | 1 | 2;
                const isFront = depth === 0;
                return (
                  <SwipeCard
                    key={post.id}
                    post={post}
                    depth={depth}
                    interactive={isFront}
                    canRewind={isFront ? queue.canRewind : false}
                    onSwipe={isFront ? handleSwipe : undefined}
                    onTap={isFront ? handleTap : undefined}
                    onDragProgress={isFront ? handleDragProgress : undefined}
                  />
                );
              })}
          </AnimatePresence>
          <SwipeOverlay drag={drag} canRewind={queue.canRewind} />
        </div>
      </div>

      <p className="mt-3 px-4 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">
        {queue.canRewind ? '↑ → next • ↓ ← previous' : '↑ → next'}
      </p>

      <SwipeHint />

      {showBreak && (
        <SwipeBreakPrompt
          cardsThisSession={sessionCards}
          onSnooze={() => {
            snoozeBreakToday();
            setShowBreak(false);
          }}
          onContinue={() => {
            setShowBreak(false);
          }}
        />
      )}

      <NewsDrawer
        post={drawerPost}
        onClose={() => setDrawerPost(null)}
        onSelectRelated={(p) => {
          markRead(p.id);
          setDrawerPost(p);
        }}
      />
    </>
  );
}
