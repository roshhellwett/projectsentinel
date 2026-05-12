'use client';

/**
 * BookmarkButton — one-tap save/unsave with optimistic UI.
 *
 * Uses `useSavedPosts` (localStorage, cross-tab synced) so saves are
 * instant and survive reloads without an auth dependency. Renders a
 * subtle pill or a square icon-only button depending on `variant`.
 */

import { useCallback } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSavedPosts } from '@/lib/utils/readPosts';
import { cn } from '@/lib/utils/cn';

interface BookmarkButtonProps {
  postId: string;
  variant?: 'icon' | 'pill';
  /** Stop event bubbling so the host card's onClick doesn't fire. */
  stopPropagation?: boolean;
  className?: string;
}

export function BookmarkButton({
  postId,
  variant = 'icon',
  stopPropagation = true,
  className,
}: BookmarkButtonProps) {
  const { isSaved, toggleSaved } = useSavedPosts();
  const saved = isSaved(postId);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
      }
      toggleSaved(postId);
    },
    [postId, toggleSaved, stopPropagation],
  );

  if (variant === 'pill') {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved' : 'Save for later'}
        className={cn(
          'touch-polish inline-flex items-center gap-2 px-4 py-2 rounded-full',
          'bg-white/70 backdrop-blur-md border text-sm font-medium',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
          saved
            ? 'border-accent/40 text-accent hover:bg-accent/5'
            : 'border-slate-950/[0.10] text-slate-600 hover:text-slate-950 hover:bg-white hover:border-accent/30',
          className,
        )}
      >
        {saved ? (
          <BookmarkCheck className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        {saved ? 'Saved' : 'Save'}
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.86 }}
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save for later'}
      title={saved ? 'Saved' : 'Save for later'}
      className={cn(
        'touch-polish p-1 -m-1 rounded-full transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
        saved
          ? 'text-accent'
          : 'text-slate-500 hover:text-accent',
        className,
      )}
    >
      {saved ? (
        <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={2.2} />
      ) : (
        <Bookmark className="w-3.5 h-3.5" strokeWidth={2} />
      )}
    </motion.button>
  );
}
