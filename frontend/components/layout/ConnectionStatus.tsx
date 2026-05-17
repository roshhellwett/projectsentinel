'use client';

// last edited 2026-05-17 by roshhellwett

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          key="offline-pill"
          initial={{ opacity: 0, y: -8, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-300/60 bg-amber-50/85 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_12px_28px_-20px_rgba(245,158,11,0.55)]"
        >
          <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0">
            <span className="absolute inset-0 rounded-full bg-amber-500/55 animate-ping" aria-hidden="true" />
          </span>
          <WifiOff className="w-3 h-3 text-amber-700" aria-hidden="true" />
          <span className="text-[11px] font-semibold tracking-normal text-amber-800">
            Offline — reconnecting
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
