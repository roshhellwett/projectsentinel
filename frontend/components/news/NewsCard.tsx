'use client';

import { memo, useCallback } from 'react';
import type { Post } from '@/types';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { truncateWords } from '@/lib/utils/truncate';
import { cn } from '@/lib/utils/cn';
import { BookmarkButton } from './BookmarkButton';
import { VerificationStamp } from '@/components/ui/VerificationStamp';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';

function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface SmartLabel {
  text: string;
  priority: number;
}

function getSmartLabel(post: Post): SmartLabel | null {
  const ageMs = Date.now() - new Date(post.published_at).getTime();
  const headline = (post.headline || '').toLowerCase();
  if (headline.includes('live:') || headline.includes('live update')) return { text: 'LIVE', priority: 4 };
  if (headline.includes('breaking') || headline.includes('alert:')) return { text: 'BREAKING', priority: 3 };
  if (ageMs < 45 * 60 * 1000 && post.credibility_score >= 80) return { text: 'JUST IN', priority: 2 };
  if (ageMs < 120 * 60 * 1000 && post.credibility_score >= 85) return { text: 'DEVELOPING', priority: 1 };
  return null;
}

interface NewsCardProps {
  post: Post;
  onClick?: () => void;
  isNew?: boolean;
  isRead?: boolean;
  wasRecentlyOpened?: boolean;
}

const NewsCardComponent = ({ post, onClick, isNew = false, isRead = false }: NewsCardProps) => {
  const haptic = useHapticFeedback();
  const smartLabel = getSmartLabel(post);
  const sourcesCount = post.source_count ?? (post.sources?.length ?? 0);
  const isVideo = post.content_type === 'video';

  const handleClick = useCallback(() => {
    haptic.light();
    onClick?.();
  }, [haptic, onClick]);

  const handleYoutubeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    haptic.light();
    const query = encodeURIComponent(`${post.headline} latest news`);
    window.open(`https://www.youtube.com/results?search_query=${query}&sp=CAI%3D`, '_blank', 'noopener,noreferrer');
  }, [haptic, post.headline]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if ((e.target as HTMLElement).closest('a, button')) return;
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div
      role="article"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`${isVideo ? 'Video: ' : 'Read article: '}${post.headline}`}
      data-read={isRead ? 'true' : 'false'}
      className={cn(
        'group relative cursor-pointer select-none touch-manipulation paper-card glass-card p-3 sm:p-4 flex flex-col h-full transition-all duration-200',
        'hover:shadow-[0_2px_8px_rgb(var(--c-ink)/0.08)] hover:border-ink/20',
        'focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:outline-none',
        isNew && 'border-l-[3px] border-ink',
        isVideo && 'border-amber-500/10 backdrop-blur-sm'
      )}
      style={isVideo ? { backdropFilter: 'blur(12px)' } : undefined}
    >
      {isVideo && (
        <span className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
          <span 
            className="absolute top-[-4px] right-[-16px] w-[50px] h-[22px] bg-amber-500/10 rotate-45" 
            style={{ 
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(217, 119, 6, 0.15)'
            }}
          />
        </span>
      )}

      <div className="flex items-start justify-between gap-1.5 sm:gap-3 mb-1.5 sm:mb-2 min-h-[18px] sm:min-h-[20px]">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 min-w-0">
          <span className="font-body text-[9px] sm:text-[11px] font-bold tracking-wider uppercase text-ink-soft">
            {post.category}
          </span>
          <span className="text-ink-soft/40" aria-hidden="true">·</span>
          <span className="font-mono text-[8px] sm:text-[10px] text-ink-soft" suppressHydrationWarning>{formatTimeAgo(post.published_at)}</span>
          {smartLabel && (
            <span
              className={cn(
                'font-body text-[9px] sm:text-[11px] font-bold tracking-wider uppercase',
                smartLabel.priority >= 3 ? 'text-red-600' : 'text-ink'
              )}
            >
              {smartLabel.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <VerificationStamp score={post.credibility_score} xsmall />
        </div>
      </div>

      <h3 className="font-body font-bold text-[14px] sm:text-[17px] leading-[1.2] sm:leading-[1.25] tracking-[-0.01em] text-ink line-clamp-3 mb-1 sm:mb-1.5 flex-shrink-0">
        {post.headline}
      </h3>

      <p className="font-body text-[11px] sm:text-[13px] leading-[1.4] sm:leading-[1.55] text-ink-soft line-clamp-2 mb-2 sm:mb-[14px] flex-shrink-0">
        {truncateWords(post.summary, 20)}
      </p>

      <div className="flex items-center justify-between gap-1.5 sm:gap-2 mt-auto pt-2 sm:pt-3 border-t border-rule/60">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <span className="inline-flex items-center gap-1 font-body text-[9px] sm:text-[11px] text-ink-soft shrink-0">
            <ShieldIcon />
            {sourcesCount} {sourcesCount === 1 ? 'source' : 'sources'}
          </span>
          <button
            type="button"
            onClick={handleYoutubeClick}
            className="inline-flex items-center gap-1 px-1 sm:px-1.5 py-0.5 border border-ink/20 text-ink bg-ink/5 hover:bg-ink/10 active:bg-ink/15 font-body text-[8px] sm:text-[10px] font-bold tracking-wider uppercase rounded transition-colors"
            aria-label={`Search YouTube: ${post.headline}`}
          >
            <YoutubeIcon className="text-ink" />
            YouTube
          </button>
        </div>
        <BookmarkButton postId={post.id} variant="icon" />
      </div>

      {isRead && (
        <span className="font-body text-[9px] sm:text-[11px] text-ink-soft/60 mt-1 sm:mt-1.5">Read</span>
      )}
    </div>
  );
};

export const NewsCard = memo(NewsCardComponent);
