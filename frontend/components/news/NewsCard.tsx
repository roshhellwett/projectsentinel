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

function YoutubeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M10 9l6 4-6 4z" />
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
    if (post.video_url) {
      window.open(post.video_url, '_blank', 'noopener,noreferrer');
    }
  }, [haptic, post.video_url]);

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
        'group relative cursor-pointer select-none touch-manipulation border border-rule bg-paper-2 rounded-[6px] p-3 sm:p-4 flex flex-col h-full transition-all duration-200',
        'hover:shadow-[0_2px_8px_rgb(var(--c-ink)/0.08)] hover:border-ink/20',
        'focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:outline-none',
        isNew && 'border-l-[3px] border-ink',
        isVideo && 'border-amber-500/10'
      )}
    >
      {isVideo && (
        <span className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
          <span className="absolute top-[-4px] right-[-16px] w-[50px] h-[22px] bg-amber-500/10 rotate-45" />
        </span>
      )}

      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 min-h-[20px]">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="font-body text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-ink-soft">
            {post.category}
          </span>
          <span className="text-ink-soft/40" aria-hidden="true">·</span>
          <span className="font-mono text-[9px] sm:text-[10px] text-ink-soft" suppressHydrationWarning>{formatTimeAgo(post.published_at)}</span>
          {smartLabel && (
            <span
              className={cn(
                'font-body text-[10px] sm:text-[11px] font-bold tracking-wider uppercase',
                smartLabel.priority >= 3 ? 'text-red-600' : 'text-ink'
              )}
            >
              {smartLabel.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <VerificationStamp score={post.credibility_score} xsmall />
        </div>
      </div>

      <h3 className="font-body font-bold text-[15px] sm:text-[17px] leading-[1.25] tracking-[-0.01em] text-ink line-clamp-3 mb-1.5 flex-shrink-0">
        {post.headline}
      </h3>

      <p className="font-body text-[12px] sm:text-[13px] leading-[1.5] sm:leading-[1.55] text-ink-soft line-clamp-2 mb-3 sm:mb-[14px] flex-shrink-0">
        {truncateWords(post.summary, 22)}
      </p>

      <div className="flex items-center justify-between gap-2 mt-auto pt-2.5 sm:pt-3 border-t border-rule/60">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <span className="inline-flex items-center gap-1 font-body text-[10px] sm:text-[11px] text-ink-soft shrink-0">
            <ShieldIcon />
            {sourcesCount} {sourcesCount === 1 ? 'source' : 'sources'}
          </span>
          {isVideo && post.video_url && (
            <button
              type="button"
              onClick={handleYoutubeClick}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-amber-500/20 text-amber-600 bg-amber-50/50 hover:bg-amber-100/60 active:bg-amber-200/60 font-body text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-[3px] transition-colors shrink-0"
              aria-label={`Watch on YouTube: ${post.headline}`}
            >
              <YoutubeIcon />
              YouTube
            </button>
          )}
        </div>
        <BookmarkButton postId={post.id} variant="icon" />
      </div>

      {isRead && (
        <span className="font-body text-[10px] sm:text-[11px] text-ink-soft/60 mt-1.5">Read</span>
      )}
    </div>
  );
};

export const NewsCard = memo(NewsCardComponent);
