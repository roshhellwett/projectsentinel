'use client';

import { useCallback, useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useSavedPosts } from '@/lib/utils/readPosts';
import { showToast } from '@/lib/utils/toast';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';

function Particle({ index }: { index: number }) {
  const angle = (index / 6) * 360;
  const distance = 16 + Math.random() * 12;
  const tx = Math.cos((angle * Math.PI) / 180) * distance;
  const ty = Math.sin((angle * Math.PI) / 180) * distance;
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981'];
  const color = colors[index % colors.length];

  return (
    <motion.span
      className="absolute rounded-full pointer-events-none z-10"
      style={{
        width: 4,
        height: 4,
        backgroundColor: color,
        left: '50%',
        top: '50%',
        marginLeft: -2,
        marginTop: -2,
      }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x: tx, y: ty, scale: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    />
  );
}

interface BookmarkButtonProps {
  postId: string;
  variant?: 'icon' | 'pill';
  stopPropagation?: boolean;
  className?: string;
}

export function BookmarkButton({
  postId,
  variant = 'icon',
  stopPropagation = true,
  className,
}: BookmarkButtonProps) {
  const reducedMotion = useReducedMotion();
  const haptic = useHapticFeedback();
  const { isSaved, toggleSaved } = useSavedPosts();
  const saved = isSaved(postId);
  const [showParticles, setShowParticles] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
      }
      const nextSaved = !saved;
      if (nextSaved) {
        haptic.medium();
        if (!reducedMotion) {
          setShowParticles(true);
          setTimeout(() => setShowParticles(false), 500);
        }
      } else {
        haptic.light();
      }
      toggleSaved(postId);
      showToast(nextSaved ? 'Saved to reading list' : 'Removed from reading list', nextSaved ? 'bookmark' : 'bookmark-off');
    },
    [postId, toggleSaved, stopPropagation, saved, haptic, reducedMotion],
  );

  if (variant === 'pill') {
    return (
      <motion.button
        type="button"
        whileTap={reducedMotion ? undefined : { scale: 0.92 }}
        whileHover={reducedMotion ? undefined : { scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved' : 'Save for later'}
        className={cn(
          buttonVariants({ variant: saved ? 'secondary' : 'outline' }),
          'relative tap-target gap-2 px-4 py-2 hover-lift transform-gpu rounded-xl font-bold shadow-sm',
          saved
            ? 'bg-like/10 border-like text-like hover:bg-like/15 shadow-glow-like'
            : 'text-muted border-rule hover:border-ink hover:bg-paper-2 hover:text-ink',
          className,
        )}
      >
        <AnimatePresence>
          {showParticles && (
            <span className="absolute inset-0 pointer-events-none overflow-visible">
              {Array.from({ length: 6 }).map((_, i) => (
                <Particle key={i} index={i} />
              ))}
            </span>
          )}
        </AnimatePresence>

        <motion.span
          key={saved ? 'saved' : 'unsaved'}
          initial={reducedMotion ? {} : { scale: 0.5, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className="flex items-center gap-2"
        >
          {saved ? (
            <BookmarkCheck className="w-4 h-4 text-like" strokeWidth={2.5} />
          ) : (
            <Bookmark className="w-4 h-4" strokeWidth={2} />
          )}
          <span>{saved ? 'Saved' : 'Save'}</span>
        </motion.span>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={reducedMotion ? undefined : { scale: 0.88 }}
      whileHover={reducedMotion ? undefined : { scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save for later'}
      className={cn(
        'group relative tap-target min-w-[44px] min-h-[44px] flex items-center justify-center touch-polish p-2 -m-2 rounded-full transition-colors duration-200 transform-gpu',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
        saved
          ? 'text-like animate-reward-pulse'
          : 'text-subtle hover:text-ink hover:bg-ink/5',
        className,
      )}
    >
      <AnimatePresence>
        {showParticles && (
          <span className="absolute inset-0 pointer-events-none overflow-visible">
            {Array.from({ length: 6 }).map((_, i) => (
              <Particle key={i} index={i} />
            ))}
          </span>
        )}
      </AnimatePresence>

      <motion.span
        key={saved ? 'icon-saved' : 'icon-unsaved'}
        initial={reducedMotion ? {} : { scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      >
        {saved ? (
          <BookmarkCheck className="w-4 h-4 text-like fill-like/20" strokeWidth={2.5} />
        ) : (
          <Bookmark className="w-4 h-4" strokeWidth={2} />
        )}
      </motion.span>

      <span className={`pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded-lg bg-ink px-2.5 py-1 text-[10px] font-bold text-paper opacity-0 transition-all group-hover:opacity-100 group-focus-visible:opacity-100 scale-95 group-hover:scale-100 ${Z_INDEX.tooltip} shadow-card`}>
        {saved ? 'Remove saved' : 'Save story'}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-[4px] border-transparent border-t-ink" />
      </span>
    </motion.button>
  );
}
