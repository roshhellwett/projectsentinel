/**
 * News card component - compact card with headline, excerpt, and score badge
 * Optimized: React.memo, keyboard accessible, no layout shift on hover
 */

'use client';

import { memo } from 'react';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CredibilityBadge } from './CredibilityBadge';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { truncateWords } from '@/lib/utils/truncate';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface NewsCardProps {
  post: Post;
  onClick?: () => void;
  isNew?: boolean;
}

const NewsCardComponent = ({ post, onClick, isNew = false }: NewsCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.article
      layoutId={`card-${post.id}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      aria-label={`Read article: ${post.headline}`}
      className={cn(
        "relative h-[210px] rounded-[1.25rem] p-5 cursor-pointer",
        "bg-white shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-shadow duration-300",
        "border border-slate-200",
        "overflow-hidden group",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
        isNew && "flash-new-post"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <CategoryTag category={post.category} />
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {formatTimeAgo(post.published_at)}
            </span>
          </div>

          <h3 className="text-base font-semibold text-slate-900 line-clamp-2 mb-2 leading-snug group-hover:text-accent transition-colors duration-300">
            {post.headline}
          </h3>

          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {truncateWords(post.summary, 14)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <CredibilityBadge score={post.credibility_score} />
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            {post.source_count} sources
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export const NewsCard = memo(NewsCardComponent);
