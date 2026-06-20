'use client';

import { useCallback } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSavedPosts } from '@/lib/utils/readPosts';
import { cn } from '@/lib/utils/cn';

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
          'inline-flex items-center gap-2 px-3.5 py-2 rounded',
          'bg-paper border text-sm font-medium',
          'transition-all duration-200 hover-lift',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          saved
            ? 'border-accent text-accent hover:bg-accent-soft'
            : 'border-rule text-muted hover:text-ink hover:border-ink',
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
      className={cn(
        'group relative touch-polish p-2 -m-2 rounded-full transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
        saved
          ? 'text-accent'
          : 'text-subtle hover:text-accent',
        className,
      )}
    >
      {saved ? (
        <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={2.2} />
      ) : (
        <Bookmark className="w-3.5 h-3.5" strokeWidth={2} />
      )}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded bg-ink px-2 py-1 text-[10px] font-semibold text-paper opacity-0 transition-all group-hover:opacity-100 group-focus-visible:opacity-100 scale-95 group-hover:scale-100 z-50 shadow-paper-lift">
        {saved ? 'Remove saved' : 'Save for later'}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-[4px] border-transparent border-t-ink" />
      </span>
    </motion.button>
  );
}
