'use client';

import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, Globe, BookOpen, Share2, Youtube } from 'lucide-react';
import { Post, Source } from '@/types';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { truncateWords } from '@/lib/utils/truncate';
import { cn } from '@/lib/utils/cn';
import { getHostname } from '@/lib/utils/getHostname';
import { BookmarkButton } from './BookmarkButton';
import { ScoreRing } from './ScoreRing';
import { SourcePickerButton } from './SourcePickerButton';
import { getCategoryTheme } from '@/lib/theme/categoryTheme';
import { CategoryIcon } from './CategoryIcon';
import { LanguageBadge } from '@/components/ui/LanguageBadge';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';
import { useI18n } from '@/lib/i18n/i18n-shared';

function estimateReadMinutes(text: string | null | undefined): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function getSmartYouTubeSearchUrl(headline: string, language: string | null | undefined = 'en'): string {
  if (!headline) return 'https://www.youtube.com/';
  // Strip common clickbait/breaking news prefixes
  let clean = headline.replace(/^(watch|breaking( news)?|live|exclusive|update|alert|just in)[\s:|-]+/i, '').trim();
  // Strip trailing publisher attributions like "- The Hindu" or "| Times of India"
  clean = clean.replace(/\s*[-|]\s*[A-Z][a-zA-Z\s]+$/, '').trim();
  // Limit to core keywords to prevent overly strict YouTube exact matching
  const words = clean.split(/\s+/).filter(Boolean);
  const coreKeywords = words.slice(0, 10).join(' ');
  // Inject localized news suffix to bias YouTube towards actual news coverage
  const newsSuffix = language === 'hi' ? 'news hindi' : (language === 'bn' ? 'news bengali' : (language === 'mr' ? 'news marathi' : 'news'));
  const query = `${coreKeywords} ${newsSuffix}`.trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithopensourceprojects.vercel.app';
}

function getSourceLabel(source: Source): string {
  if (source.title?.trim()) return source.title.trim();
  if (source.name?.trim())  return source.name.trim();
  const host = getHostname(source.url);
  return host || 'Source';
}

const SourceCount = memo(function SourceCount({ count }: { count: number }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted">
      <ShieldCheck className="w-3.5 h-3.5 text-cred-high" aria-hidden="true" />
      <span className="tabular-nums font-bold text-ink">{count}</span>
      <span>{count === 1 ? t('card.source') : t('card.sources_verified')}</span>
    </span>
  );
});

interface NewsCardProps {
  post: Post;
  onClick?: () => void;
  isNew?: boolean;
  isRead?: boolean;
  wasRecentlyOpened?: boolean;
}

interface SmartPill {
  label: string;
  icon?: string;
  colorClass: string;
  dotColor: string;
}

function getSmartLivePill(post: Post): SmartPill | null {
  const ageMs = Date.now() - new Date(post.published_at).getTime();
  const isRecent = ageMs < 120 * 60 * 1000; // 2 hours
  const isSuperRecent = ageMs < 45 * 60 * 1000; // 45 mins
  const headline = (post.headline || '').toLowerCase();

  if (headline.includes('live:') || headline.includes('live update')) {
    return { label: 'LIVE', icon: '🔴', colorClass: 'bg-red-500 text-white', dotColor: 'bg-white' };
  }

  if (headline.includes('breaking') || headline.includes('alert:')) {
    return { label: 'BREAKING', icon: '⚡', colorClass: 'bg-amber-500 text-black', dotColor: 'bg-black' };
  }

  if (isSuperRecent && post.credibility_score >= 80) {
    return { label: 'JUST IN', colorClass: 'bg-blue-500 text-white', dotColor: 'bg-white' };
  }

  if (isRecent && post.credibility_score >= 85) {
    return { label: 'DEVELOPING', colorClass: 'bg-orange-500 text-white', dotColor: 'bg-white' };
  }
  
  if (isRecent && post.credibility_score >= 90) {
     return { label: 'HOT', icon: '🔥', colorClass: 'bg-rose-500 text-white', dotColor: 'bg-white' };
  }

  return null;
}

const NewsCardComponent = ({ post, onClick, isNew = false, isRead = false, wasRecentlyOpened = false }: NewsCardProps) => {
  const haptic = useHapticFeedback();
  const { t } = useI18n();
  const smartPill = getSmartLivePill(post);
  const theme = getCategoryTheme(post.category);
  const topSources = (post.sources ?? []).slice(0, 4);
  const sourcesTotal = post.source_count ?? topSources.length;
  const readMinutes = estimateReadMinutes(post.summary);

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
          if ((e.target as HTMLElement).closest('a, button, [role="menuitem"], [role="button"]:not([role="article"])')) return;
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Read article: ${post.headline}`}
      data-read={isRead ? 'true' : 'false'}
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 380px' }}
      className={cn(
        'group relative isolate flex flex-col h-full cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] active:scale-[0.98]',
        'bg-[#ffffff] dark:bg-[#13131c] hover:bg-[#faf9f6] dark:hover:bg-[#1a1a26] border border-rule dark:border-white/15 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        'transform-gpu backface-hidden select-none touch-action-manipulation',
        isNew && 'ring-2 ring-accent/50 shadow-[0_0_15px_rgba(var(--accent),0.3)]',
        'contain-layout'
      )}
    >
      {/* Category accent gradient line & ambient background */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 group-hover:h-2"
        style={{ background: theme.cssGradient }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.05] transition-opacity duration-500 group-hover:opacity-[0.1] pointer-events-none"
        style={{ background: `radial-gradient(circle at 0% 0%, ${theme.gradientFrom}, transparent 70%)` }}
        aria-hidden="true"
      />
      
      {/* Main card content */}
      <div className="relative z-10 flex flex-col flex-1 p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0 pt-0.5">
            {/* Category pill with color */}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.06em] rounded-full border shadow-2xs"
              style={theme.pill}
            >
              <CategoryIcon name={theme.icon} className="w-3 h-3 opacity-80" strokeWidth={2.2} aria-hidden="true" />
              {theme.label}
            </span>

            {smartPill && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.08em] rounded-full shadow-2xs ${smartPill.colorClass}`}>
                {smartPill.icon ? (
                  <span className="text-[10px] leading-none">{smartPill.icon}</span>
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${smartPill.dotColor}`} />
                )}
                {smartPill.label}
              </span>
            )}

            <a
              href={getSmartYouTubeSearchUrl(post.headline, post.language)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 text-[9.5px] font-extrabold uppercase tracking-[0.06em] rounded-full transition-colors"
              title="Search video on YouTube"
              aria-label={`Search video for ${post.headline} on YouTube`}
            >
              <Youtube className="w-3 h-3" />
              YOUTUBE
            </a>

            <span
              className="inline-flex items-center text-[10.5px] text-muted font-medium ml-1"
              suppressHydrationWarning
            >
              <span suppressHydrationWarning>{formatTimeAgo(post.published_at)}</span>
            </span>
          </div>

          <div className="flex-shrink-0">
            {/* Score ring — prominent position */}
            <ScoreRing score={post.credibility_score} compact />
          </div>
        </div>



        <h3 className="font-display text-[19px] sm:text-[20.5px] md:text-[22px] font-bold leading-[1.22] tracking-[-0.02em] text-ink line-clamp-4 mb-3 transition-colors duration-200 group-hover:text-accent drop-shadow-sm">
          {post.headline}
        </h3>

        <p className="text-[13.5px] sm:text-[14px] text-muted/90 leading-[1.6] line-clamp-2 mb-6">
          {truncateWords(post.summary, 24)}
        </p>

        <div className="mt-auto pt-4 border-t border-rule/60">
          <div className="flex items-center gap-3 mb-3">
            <SourceCount count={sourcesTotal} />
            <span className="inline-flex items-center gap-1 text-[11px] text-muted font-medium ml-auto">
              <LanguageBadge language={post.language} />
              <BookOpen className="w-3 h-3" aria-hidden="true" />
              <span className="tabular-nums">{readMinutes}</span>
              <span>{t('card.min_read')}</span>
            </span>
          </div>

          <div className={`relative ${Z_INDEX.cardOverlay} flex items-center justify-between gap-2`}>
            <SourcePickerButton
              sources={post.sources}
              label={t('card.read_full')}
              className="flex-1 min-w-0 max-w-[60%]"
              buttonClassName="px-3 py-1.5 text-[10px] font-semibold"
            />

            <div className="flex items-center gap-0.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${post.headline} — ${getSiteUrl()}/news/${post.id}/`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="tap-target min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 -m-1 rounded-full text-subtle hover:text-accent hover:bg-accent/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={t('card.share_whatsapp')}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <BookmarkButton postId={post.id} variant="icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Read overlay badge */}
      {isRead && (
        <div className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cred-high/15 text-cred-high text-[10px] font-bold md:backdrop-blur-sm">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          {t('card.read')}
        </div>
      )}
    </div>
  );
};

export const NewsCard = memo(NewsCardComponent);
