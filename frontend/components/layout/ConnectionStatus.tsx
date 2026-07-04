'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';

export function ConnectionStatus() {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="flex-shrink-0" aria-live="polite">
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-pill"
          initial={{ opacity: 0, y: -8, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cred-mid/40 bg-paper backdrop-blur-md shadow-paper-lift"
        >
          <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-cred-mid flex-shrink-0">
            <span className="absolute inset-0 rounded-full bg-cred-mid/55 animate-ping" aria-hidden="true" />
          </span>
          <WifiOff className="w-3 h-3 text-cred-mid" aria-hidden="true" />
          <span className="text-[11px] font-semibold tracking-normal text-cred-mid">
            Offline — reconnecting
          </span>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}
