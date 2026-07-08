'use client';

import { memo, useCallback } from 'react';
import { Post } from '@/types';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { truncateWords } from '@/lib/utils/truncate';
import { cn } from '@/lib/utils/cn';
import { BookmarkButton } from './BookmarkButton';
import { VerificationStamp } from '@/components/ui/VerificationStamp';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';
import { useI18n } from '@/lib/i18n/i18n-shared';

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

interface NewsCardProps {
  post: Post;
  onClick?: () => void;
  isNew?: boolean;
  isRead?: boolean;
  wasRecentlyOpened?: boolean;
}

function getSmartLabel(post: Post): string | null {
  const ageMs = Date.now() - new Date(post.published_at).getTime();
  const isRecent = ageMs < 120 * 60 * 1000;
  const isSuperRecent = ageMs < 45 * 60 * 1000;
  const headline = (post.headline || '').toLowerCase();
  if (headline.includes('live:') || headline.includes('live update')) return 'LIVE';
  if (headline.includes('breaking') || headline.includes('alert:')) return 'BREAKING';
  if (isSuperRecent && post.credibility_score >= 80) return 'JUST IN';
  if (isRecent && post.credibility_score >= 85) return 'DEVELOPING';
  return null;
}

const NewsCardComponent = ({ post, onClick, isNew = false, isRead = false }: NewsCardProps) => {
  const haptic = useHapticFeedback();
  const { t } = useI18n();
  const smartLabel = getSmartLabel(post);
  const sourcesCount = post.source_count ?? (post.sources?.length ?? 0);
  const isVideo = post.content_type === 'video';

  const handleClick = useCallback(() => {
    haptic.light();
    onClick?.();
  }, [haptic, onClick]);

  return (
    <div
      role="article"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if ((e.target as HTMLElement).closest('a, button')) return;
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Read article: ${post.headline}`}
      data-read={isRead ? 'true' : 'false'}
      className={cn(
        'cursor-pointer select-none touch-manipulation border border-rule bg-paper-2 rounded-[6px] p-4 flex flex-col h-full transition-shadow hover:shadow-[0_2px_6px_rgb(var(--c-ink)/0.1)]',
        isNew && 'border-l-2 border-ink'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2 min-h-[20px]">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="font-body text-[11px] font-bold tracking-wider uppercase text-ink-soft">
            {post.category}
          </span>
          <span className="font-mono text-[10px] text-ink-soft" suppressHydrationWarning>{formatTimeAgo(post.published_at)}</span>
          {smartLabel && (
            <span className="font-body text-[11px] font-bold tracking-wider uppercase text-ink">{smartLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <VerificationStamp score={post.credibility_score} xsmall />
        </div>
      </div>

      <h3 className="font-body font-bold text-[17px] leading-[1.25] tracking-[-0.01em] text-ink line-clamp-3 mb-1.5 flex-shrink-0">
        {post.headline}
      </h3>

      <p className="font-body text-[13px] leading-[1.55] text-ink-soft line-clamp-2 mb-[14px] flex-shrink-0">
        {truncateWords(post.summary, 22)}
      </p>

      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-rule/60">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 font-body text-[11px] text-ink-soft">
            <ShieldIcon />
            {sourcesCount} {sourcesCount === 1 ? 'source' : 'sources'}
          </span>
          {isVideo && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-ink/15 text-ink-soft font-body text-[10px] font-bold tracking-wider uppercase">
              <YoutubeIcon />
              Video
            </span>
          )}
        </div>
        <BookmarkButton postId={post.id} variant="icon" />
      </div>

      {isRead && (
        <div className="font-body text-[11px] text-ink-soft mt-1">Read</div>
      )}
    </div>
  );
};

export const NewsCard = memo(NewsCardComponent);
