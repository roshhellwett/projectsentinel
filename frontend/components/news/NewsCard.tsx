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

const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://indiaverified.in';

function isBreaking(post: Post): boolean {
  const ageMs = Date.now() - new Date(post.published_at).getTime();
  return ageMs < 90 * 60 * 1000 && post.credibility_score >= 80;
}

const NewsCardComponent = ({ post, onClick, isNew = false }: NewsCardProps) => {
  const breaking = isBreaking(post);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${siteUrl}/news/${post.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${post.headline} ${url}`)}`, '_blank', 'noopener');
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

      {/* Breaking badge */}
      {breaking && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
          BREAKING
        </div>
      )}
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3.5">
          <CategoryTag category={post.category} />
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            {formatTimeAgo(post.published_at)}
          </span>
        </div>

        {/* Headline */}
        <h3 className={cn(
          "text-[15px] font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2.5 leading-snug group-hover:text-india-saffron transition-colors duration-300",
          breaking && "pr-16"
        )}>
          {post.headline}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-auto">
          {truncateWords(post.summary, 18)}
        </p>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
          <CredibilityBadge score={post.credibility_score} />
          <div className="flex items-center gap-2">
            {/* WhatsApp quick share */}
            <button
              onClick={handleWhatsApp}
              aria-label="Share on WhatsApp"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-all duration-200 flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              {post.source_count} sources
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export const NewsCard = memo(NewsCardComponent);
