'use client';

import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';
import { WifiOff, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { useState, useCallback, useEffect, useRef } from 'react';

const POLL_INTERVAL = 5000;

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const [retrying, setRetrying] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-poll when offline to detect reconnection
  useEffect(() => {
    if (!isOnline && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch('/api/posts/?limit=1', { cache: 'no-store', signal: AbortSignal.timeout(3000) });
          if (res.ok || navigator.onLine) {
            window.location.reload();
          }
        } catch {
          // still offline
        }
      }, POLL_INTERVAL);
    }
    if (isOnline && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isOnline]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      const res = await fetch('/api/posts/?limit=1', { cache: 'no-store', signal: AbortSignal.timeout(3000) });
      if (res.ok || navigator.onLine) {
        window.location.reload();
      }
    } catch {
      // still offline
    } finally {
      setRetrying(false);
    }
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ top: 'env(safe-area-inset-top, 0px)' }}
          className={`fixed inset-x-0 top-0 ${Z_INDEX.offlineBanner} flex justify-center p-2 pointer-events-none`}
        >
          <div className="bg-ink dark:bg-paper text-paper dark:text-ink px-4 py-2 rounded-full shadow-2xl border border-white/10 dark:border-black/10 flex items-center gap-3 text-[13px] font-semibold tracking-wide pointer-events-auto md:backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <WifiOff className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Offline — showing cached stories</span>
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 rounded-md transition-colors active:scale-95 disabled:opacity-50"
              aria-label="Retry connection"
            >
              <RefreshCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Checking...' : 'Retry'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
