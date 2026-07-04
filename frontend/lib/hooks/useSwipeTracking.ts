import { useState, useRef, useEffect, useCallback } from 'react';
import type { Post } from '@/types';
import { getHostname } from '@/lib/utils/getHostname';
import {
  bumpStreak,
  getCardsToday,
  getStreak,
  getUniqueHostsToday,
  incrementCardsToday,
  isBreakSnoozedToday,
  pruneStaleStatsKeys,
  recordHostsToday,
} from '@/lib/utils/swipeStats';

const BREAK_PROMPT_AT = 25;

export function useSwipeTracking() {
  const [stats, setStats] = useState({
    cardsToday: 0,
    uniqueHostsToday: 0,
    streak: 0,
  });

  const [showBreak, setShowBreak] = useState(false);
  const sessionCardsRef = useRef(0);
  const breakShownRef = useRef(false);

  const refreshStats = useCallback(() => {
    setStats({
      cardsToday: getCardsToday(),
      uniqueHostsToday: getUniqueHostsToday(),
      streak: getStreak(),
    });
  }, []);

  useEffect(() => {
    pruneStaleStatsKeys();
    bumpStreak();
    refreshStats();

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('iv:swipe:')) {
        refreshStats();
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshStats();
      }
    };
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshStats]);

  const recordSourceHosts = useCallback((post: Post) => {
    const hosts = (post.sources ?? [])
      .map((s) => getHostname(s.url))
      .filter((h): h is string => Boolean(h));
    if (hosts.length > 0) recordHostsToday(hosts);
  }, []);

  const [sessionCards, setSessionCards] = useState(0);

  const trackSwipe = useCallback((post: Post) => {
    incrementCardsToday();
    recordSourceHosts(post);
    sessionCardsRef.current += 1;
    setSessionCards(sessionCardsRef.current);
    refreshStats();

    if (
      !breakShownRef.current &&
      !isBreakSnoozedToday() &&
      sessionCardsRef.current >= BREAK_PROMPT_AT
    ) {
      breakShownRef.current = true;
      setShowBreak(true);
    }
  }, [recordSourceHosts, refreshStats]);

  return {
    stats,
    showBreak,
    setShowBreak,
    trackSwipe,
    refreshStats,
    sessionCards,
  };
}
