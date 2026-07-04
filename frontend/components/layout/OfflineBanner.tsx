'use client';

import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Z_INDEX } from '@/lib/theme/zIndex';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ top: 'env(safe-area-inset-top, 0px)' }}
          className={`fixed inset-x-0 ${Z_INDEX.offlineBanner} flex justify-center pointer-events-none`}
        >
          <div className="bg-accent text-paper px-4 py-2 mt-2 rounded-full shadow-lg flex items-center gap-2 text-[13px] font-medium tracking-wide">
            <WifiOff className="w-4 h-4" />
            <span>You are currently offline. Showing cached content.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
