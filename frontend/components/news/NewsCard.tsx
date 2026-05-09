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
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
      aria-label={`Read article: ${post.headline}`}
      className={cn(
        "relative rounded-2xl p-5 cursor-pointer",
        "bg-white dark:bg-slate-900 shadow-card hover:shadow-card-hover transition-shadow duration-500",
        "border border-slate-200/80 dark:border-slate-700/80 hover:border-india-saffron/30 dark:hover:border-india-saffron/20",
        "overflow-hidden group",
        "focus:outline-none focus:ring-2 focus:ring-india-saffron/50 focus:ring-offset-2 focus:ring-offset-background",
        isNew && "flash-new-post"
      )}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-india-saffron/[0.03] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Top saffron accent on hover */}
      <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-india-saffron to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-full" />
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3.5">
          <CategoryTag category={post.category} />
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            {formatTimeAgo(post.published_at)}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2.5 leading-snug group-hover:text-india-saffron transition-colors duration-300">
          {post.headline}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-auto">
          {truncateWords(post.summary, 18)}
        </p>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
          <CredibilityBadge score={post.credibility_score} />
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
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
