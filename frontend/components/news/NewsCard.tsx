'use client';

import { memo } from 'react';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CredibilityBadge } from './CredibilityBadge';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { truncateWords } from '@/lib/utils/truncate';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { BookmarkButton } from './BookmarkButton';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

const CATEGORY_BORDER_COLOR: Record<string, string> = {
  politics: '#f43f5e',
  business: '#10b981',
  sports: '#0ea5e9',
  crime: '#f97316',
  science: '#8b5cf6',
  health: '#ec4899',
  tech: '#06b6d4',
  world: '#f59e0b',
  entertainment: '#d946ef',
  education: '#a78bfa',
};

interface NewsCardProps {
  post: Post;
  onClick?: () => void;
  isNew?: boolean;
  /** When true, dim the card and hide the unread dot — user has already opened this story. */
  isRead?: boolean;
}

function isBreaking(post: Post): boolean {
  const ageMs = Date.now() - new Date(post.published_at).getTime();
  return ageMs < 90 * 60 * 1000 && post.credibility_score >= 80;
}

const NewsCardComponent = ({ post, onClick, isNew = false, isRead = false }: NewsCardProps) => {
  const breaking = isBreaking(post);
  const accentColor = CATEGORY_BORDER_COLOR[post.category] ?? '#0a84ff';
  const sourceName = post.sources?.[0]?.title ?? post.sources?.[0]?.name ?? null;

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
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      aria-label={`Read article: ${post.headline}`}
      className={cn(
        'group relative isolate flex flex-col h-full cursor-pointer',
        'rounded-[1.65rem] overflow-hidden',
        'premium-card',
        'transition-shadow duration-300',
        'hover:bg-white/90 hover:border-slate-950/[0.16]',
        'hover:shadow-[0_24px_70px_-38px_rgba(10,132,255,0.36),0_28px_70px_-54px_rgba(15,23,42,0.34)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isRead && 'news-card-read',
        isNew && 'flash-new-post'
      )}
      data-read={isRead ? 'true' : 'false'}
      style={{ contain: 'layout paint' }}
    >
      {/* Category colour accent bar */}
      <div
        className="relative z-10 h-[3px] w-full flex-shrink-0 opacity-85"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />

      {/* Inner content */}
      <div className="relative z-10 flex flex-col flex-1 p-5">
        {/* Source + breaking badge + time row */}
        <div className="flex items-center gap-2 mb-3">
          {!isRead && (
            <span
              className="relative inline-flex w-2 h-2 rounded-full bg-accent flex-shrink-0 shadow-[0_0_10px_rgba(10,132,255,0.85)]"
              aria-label="Unread"
              title="Unread"
            >
              <span className="absolute inset-0 rounded-full bg-accent/55 animate-ping" aria-hidden="true" />
            </span>
          )}
          {sourceName ? (
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[110px]">
              {sourceName}
            </span>
          ) : (
            <CategoryTag category={post.category} />
          )}
          {breaking && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/90 text-white text-[9px] font-bold uppercase tracking-wider flex-shrink-0 shadow-[0_0_18px_rgba(239,68,68,0.35)]"
              suppressHydrationWarning
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Breaking
            </span>
          )}
          <span
            className="text-[10px] text-slate-500 flex-shrink-0 ml-auto"
            suppressHydrationWarning
          >
            {formatTimeAgo(post.published_at)}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-[16px] md:text-[18px] font-bold text-slate-950 tracking-tight line-clamp-3 mb-2.5 leading-snug group-hover:text-accent transition-colors duration-150">
          {post.headline}
        </h3>

        {/* Excerpt */}
        <p className="text-[13px] text-slate-600 line-clamp-2 leading-relaxed mb-auto">
          {truncateWords(post.summary, 22)}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-950/[0.08]">
          <CredibilityBadge score={post.credibility_score} compact />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">
              {post.source_count} {post.source_count === 1 ? 'source' : 'sources'}
            </span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${post.headline} — ${siteUrl}/news/${post.id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="touch-polish text-slate-500 hover:text-[#25D366] transition-all duration-200 p-1 -m-1 rounded-full active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/60"
              aria-label="Share on WhatsApp"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <BookmarkButton postId={post.id} variant="icon" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const NewsCard = memo(NewsCardComponent);
