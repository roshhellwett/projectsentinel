'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Post } from '@/types';
import { SwipeCard, type SwipeDirection } from './SwipeCard';
import { SwipeOverlay } from './SwipeOverlay';
import { SwipeProgress } from './SwipeProgress';
import { SwipeHint } from './SwipeHint';
import { SwipeBreakPrompt } from './SwipeBreakPrompt';
import { SwipeEmptyState } from './SwipeEmptyState';
import { NewsDrawer } from '@/components/news/NewsDrawer';
import { useSwipeQueue, type HistoryEntry } from '@/lib/hooks/useSwipeQueue';
import { useReadPosts, useSavedPosts } from '@/lib/utils/readPosts';
import { markSeen } from '@/lib/utils/seenSet';
import {
  bumpStreak,
  getCardsToday,
  getStreak,
  getUniqueHostsToday,
  incrementCardsToday,
  isBreakSnoozedToday,
  pruneStaleStatsKeys,
  recordHostsToday,
  snoozeBreakToday,
} from '@/lib/utils/swipeStats';
import { getHostname } from '@/lib/utils/getHostname';
import { Undo2 } from 'lucide-react';

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
  const [drawerPost, setDrawerPost] = useState<Post | null>(null);
  const [showBreak, setShowBreak] = useState(false);



  const [undoToast, setUndoToast] = useState<{
    entry: HistoryEntry;
    label: string;
  } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [stats, setStats] = useState({
    cardsToday: 0,
    uniqueHostsToday: 0,
    streak: 0,
  });
  const sessionCardsRef = useRef(0);
  const breakShownRef = useRef(false);


  useEffect(() => {
    pruneStaleStatsKeys();
    bumpStreak();
    setStats({
      cardsToday: getCardsToday(),
      uniqueHostsToday: getUniqueHostsToday(),
      streak: getStreak(),
    });
  }, []);


  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const refreshStats = useCallback(() => {
    setStats({
      cardsToday: getCardsToday(),
      uniqueHostsToday: getUniqueHostsToday(),
      streak: getStreak(),
    });
  }, []);

  const recordSourceHosts = useCallback((post: Post) => {
    const hosts = (post.sources ?? [])
      .map((s) => getHostname(s.url))
      .filter((h): h is string => Boolean(h));
    if (hosts.length > 0) recordHostsToday(hosts);
  }, []);


  const showUndoToast = useCallback((entry: HistoryEntry) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const label =
      entry.direction === 'right' ? 'Saved' :
      entry.direction === 'left'  ? 'Dismissed' :
                                     'Skipped';
    setUndoToast({ entry, label });
    undoTimerRef.current = setTimeout(() => {
      setUndoToast(null);
    }, UNDO_TOAST_MS);
  }, []);


  const performUndo = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const entry = queue.rewind();
    if (entry && entry.wasSaved) {

      unsaveBookmark(entry.post.id);
    }
    setUndoToast(null);
    setDrag({ x: 0, y: 0 });
  }, [queue, unsaveBookmark]);

  const handleSwipe = useCallback(
    (direction: SwipeDirection, post: Post) => {
      if (direction === 'down') {

        const entry = queue.rewind();
        if (entry && entry.wasSaved) {
          unsaveBookmark(entry.post.id);
        }
        setDrag({ x: 0, y: 0 });
        setUndoToast(null);
        return;
      }


      const didSave = direction === 'right';
      if (didSave) {
        saveBookmark(post.id);
      }

      markSeen(post.id);

      incrementCardsToday();
      recordSourceHosts(post);
      sessionCardsRef.current += 1;
      queue.advance(post, direction as 'up' | 'left' | 'right', didSave);
      refreshStats();
      setDrag({ x: 0, y: 0 });


      showUndoToast({ post, direction: direction as 'up' | 'left' | 'right', wasSaved: didSave });

      if (
        !breakShownRef.current &&
        !isBreakSnoozedToday() &&
        sessionCardsRef.current >= BREAK_PROMPT_AT
      ) {
        breakShownRef.current = true;
        setShowBreak(true);
      }
    },
    [queue, saveBookmark, unsaveBookmark, recordSourceHosts, refreshStats, showUndoToast],
  );

  const handleTap = useCallback(
    (post: Post) => {
      markRead(post.id);
      setDrawerPost(post);
    },
    [markRead],
  );

  const handleRewindButton = useCallback(() => {
    const entry = queue.rewind();
    if (entry && entry.wasSaved) {
      unsaveBookmark(entry.post.id);
    }
    setUndoToast(null);
  }, [queue, unsaveBookmark]);

  const { current, next, upcoming } = queue;
  const visible = useMemo(
    () => [current, next, upcoming].filter(Boolean) as Post[],
    [current, next, upcoming],
  );

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
          className="px-4 py-2.5 bg-ink text-paper text-[13px] font-semibold rounded hover:bg-ink/90 transition-all hover-lift disabled:opacity-60 disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

      <div className="relative w-full">
        <div className="relative grid w-full max-w-md mx-auto px-4 [&>*]:[grid-area:1/1]">
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
                  canSwipeDown={isFront ? queue.canRewind : false}
                  onSwipe={isFront ? handleSwipe : undefined}
                  onTap={isFront ? handleTap : undefined}
                  onDragProgress={isFront ? setDrag : undefined}
                />
              );
            })}
          <SwipeOverlay drag={drag} />
        </div>
      </div>

      <p className="mt-3 px-4 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-subtle">
        ↑ skip • ← dismiss • → save • ↓ go back
      </p>


      <AnimatePresence>
        {undoToast && (
          <motion.div
            key="undo-toast"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60]"
          >
            <button
              type="button"
              onClick={performUndo}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-ink text-paper text-[12px] font-semibold rounded-full shadow-paper-lift hover:bg-ink/90 active:scale-95 transition-all hover-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`Undo: ${undoToast.label}`}
            >
              <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{undoToast.label}</span>
              <span className="text-paper/60">·</span>
              <span className="text-paper/80">Undo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <SwipeHint />

      {showBreak && (
        <SwipeBreakPrompt
          cardsThisSession={sessionCardsRef.current}
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
