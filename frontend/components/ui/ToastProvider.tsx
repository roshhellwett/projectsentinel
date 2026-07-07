'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BookmarkCheck, BookmarkMinus, Share2, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { useToasts } from '@/lib/utils/toast';
import { IOS_SPRING } from '@/lib/theme/animations';

export function ToastProvider() {
  const reducedMotion = useReducedMotion();
  const toasts = useToasts();

  return (
    <div 
      className={`fixed sm:bottom-10 left-1/2 -translate-x-1/2 ${Z_INDEX.toast} flex flex-col items-center gap-2 pointer-events-none`}
      style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
      aria-live="polite"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            layout={!reducedMotion}
            key={toast.id}
            role={toast.icon === 'error' ? 'alert' : 'status'}
            aria-live={toast.icon === 'error' ? 'assertive' : 'polite'}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 24, scale: reducedMotion ? 1 : 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.96, transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] } }}
            transition={reducedMotion ? { duration: 0.15 } : IOS_SPRING.snappy}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-ink text-paper rounded-full shadow-paper-lift md:backdrop-blur-md will-change-transform transform-gpu"
          >
            {toast.icon === 'bookmark' && <BookmarkCheck className="w-4 h-4 text-paper/80" strokeWidth={2.5} />}
            {toast.icon === 'bookmark-off' && <BookmarkMinus className="w-4 h-4 text-paper/80" strokeWidth={2.5} />}
            {toast.icon === 'share' && <Share2 className="w-4 h-4 text-paper/80" strokeWidth={2.5} />}
            {toast.icon === 'success' && <CheckCircle2 className="w-4 h-4 text-paper/80" strokeWidth={2.5} />}
            {toast.icon === 'error' && <AlertCircle className="w-4 h-4 text-paper/80" strokeWidth={2.5} />}
            <span className="text-xs font-semibold tracking-wide whitespace-nowrap">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
