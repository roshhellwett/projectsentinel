'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BookmarkCheck, BookmarkMinus, Share2, CheckCircle2 } from 'lucide-react';
import { useToasts } from '@/lib/utils/toast';

export function ToastProvider() {
  const toasts = useToasts();

  return (
    <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            layout
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-ink text-paper rounded-full shadow-paper-lift backdrop-blur-md"
          >
            {toast.icon === 'bookmark' && <BookmarkCheck className="w-4 h-4 text-paper/80" strokeWidth={2.5} />}
            {toast.icon === 'bookmark-off' && <BookmarkMinus className="w-4 h-4 text-paper/80" strokeWidth={2.5} />}
            {toast.icon === 'share' && <Share2 className="w-4 h-4 text-paper/80" strokeWidth={2.5} />}
            {toast.icon === 'success' && <CheckCircle2 className="w-4 h-4 text-paper/80" strokeWidth={2.5} />}
            <span className="text-xs font-semibold tracking-wide whitespace-nowrap">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
