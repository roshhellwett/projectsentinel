'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';

export function ConnectionStatus() {
  const { isOnline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      setShowReconnected(false);
    } else if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOnline]);

  return (
    <div className="flex-shrink-0" aria-live="polite">
      <AnimatePresence mode="wait">
        {!isOnline && (
          <motion.div
            key="offline-pill"
            initial={{ opacity: 0, y: -8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cred-mid/40 bg-paper md:bg-paper/90 md:backdrop-blur-xl shadow-paper-lift"
            title="You are currently offline. Showing cached content."
          >
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-cred-mid flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-cred-mid/55 animate-ping" aria-hidden="true" />
            </span>
            <WifiOff className="w-3 h-3 text-cred-mid" aria-hidden="true" />
            <span className="text-[11px] font-semibold tracking-normal text-cred-mid whitespace-nowrap">
              Offline — Cached
            </span>
          </motion.div>
        )}

        {isOnline && showReconnected && (
          <motion.div
            key="online-pill"
            initial={{ opacity: 0, y: -8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-500/40 bg-paper md:bg-paper/90 md:backdrop-blur-xl shadow-paper-lift"
          >
            <span className="inline-flex w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            <Wifi className="w-3 h-3 text-green-500" aria-hidden="true" />
            <span className="text-[11px] font-semibold tracking-normal text-green-500 whitespace-nowrap">
              Back online!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
