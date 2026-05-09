'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CredibilityBadge } from './CredibilityBadge';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { truncateWords } from '@/lib/utils/truncate';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { ArrowRight } from 'lucide-react';

interface NewsCardProps {
  post: Post;
  onClick?: () => void;
  isNew?: boolean;
}

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

  return (
    <motion.div
      layoutId={`card-${post.id}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      aria-label={`Read article: ${post.headline}`}
      className={cn(
        'group relative isolate flex flex-col h-full cursor-pointer',
        'rounded-2xl overflow-hidden',
        'bg-white/[0.04] backdrop-blur-xl',
        'border border-white/[0.08]',
        'transition-all duration-300',
        'hover:bg-white/[0.06] hover:border-accent/30',
        'hover:shadow-[0_0_0_1px_rgba(37,99,235,0.15),0_20px_60px_-12px_rgba(37,99,235,0.25)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isNew && 'flash-new-post'
      )}
      style={{ contain: 'layout paint' }}
    >
      {/* Top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Inner content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Breaking pill */}
        {breaking && (
          <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cred-low/90 text-white text-[9px] font-bold uppercase tracking-wider shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
            <span>Breaking</span>
          </div>
        )}

        {/* Top row — category + time */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <CategoryTag category={post.category} />
          <span className="text-[10px] font-medium text-zinc-600 flex-shrink-0">
            {formatTimeAgo(post.published_at)}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-[15.5px] md:text-base font-semibold text-white tracking-tight line-clamp-3 mb-2.5 leading-snug group-hover:text-white transition-colors duration-200">
          {post.headline}
        </h3>

        {/* Excerpt */}
        <p className="text-[13px] text-zinc-400 line-clamp-2 leading-relaxed mb-auto">
          {truncateWords(post.summary, 18)}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3.5 border-t border-white/[0.05]">
          <CredibilityBadge score={post.credibility_score} compact />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-zinc-600">
              {post.source_count} source{post.source_count === 1 ? '' : 's'}
            </span>
            <span className="text-zinc-700 group-hover:text-accent transition-colors duration-300">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const NewsCard = memo(NewsCardComponent);
