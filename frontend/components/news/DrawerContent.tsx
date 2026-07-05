'use client';

import { Post, Source } from '@/types';
import { memo, useState } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { CorrectionsNotice } from './CorrectionsNotice';
import { CredibilityBar } from './CredibilityBar';
import { SourceLinks } from './SourceLinks';
import { DrawerRelated } from './DrawerRelated';
import { typographyStyles } from '@/lib/theme/typography';
import { cn } from '@/lib/utils/cn';
import { getHostname } from '@/lib/utils/getHostname';

const SourceFaviconChip = memo(function SourceFaviconChip({ source }: { source: Source }) {
  const [errored, setErrored] = useState(false);
  const host = getHostname(source.url);
  if (!host || errored) {
    return (
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-paper border border-rule text-subtle flex-shrink-0">
        <Globe className="w-2.5 h-2.5" />
      </span>
    );
  }
  return (
  
    <img
      src={`https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`}
      alt=""
      width={16}
      height={16}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      sizes="16px"
      className="w-4 h-4 rounded-sm flex-shrink-0 bg-paper border border-rule shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
    />
  );
});

interface DrawerContentProps {
  post: Post;
  onSelectRelated?: (post: Post) => void;
}

export function DrawerContent({ post, onSelectRelated }: DrawerContentProps) {
  return (
    <article className={`article-drawer-scroll relative z-10 flex-1 overflow-y-auto overscroll-contain bg-paper px-5 pb-6 pt-6 sm:px-8 sm:pb-10 sm:pt-7 lg:px-10 lg:pt-12 lg:pb-12 flex flex-col ${post.status === 'retracted' ? 'opacity-50' : ''}`}>
      {post.status === 'corrected' && (
        <CorrectionsNotice type="corrected" note={post.correction_note} />
      )}
      {post.status === 'retracted' && (
        <CorrectionsNotice type="retracted" note={post.correction_note} />
      )}

      <h2 className={cn(typographyStyles.drawer.headline, "mb-5")}>
        {post.headline}
      </h2>

      <div className="mb-7 rounded-xl border border-rule/50 bg-paper-2/60 backdrop-blur-sm p-5 lg:p-5 shadow-sm">
        <CredibilityBar score={post.credibility_score} />
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-rule pt-3">
          <span className={typographyStyles.kicker}>
            Verified Sources
          </span>
          <span className="text-sm font-semibold tabular-nums text-ink">
            {(post.source_count ?? (post.sources?.length || 0))} {(post.source_count ?? (post.sources?.length || 0)) === 1 ? 'source' : 'sources'}
          </span>
        </div>
        {post.sources && post.sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-rule">
            {post.sources.slice(0, 5).map((src, i) => (
              <a
                key={src.url || i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-paper border border-rule text-[11px] font-medium text-muted hover:border-ink hover:text-ink transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={`Open source: ${src.title || src.name || getHostname(src.url)} (opens in new tab)`}
              >
                <SourceFaviconChip source={src} />
                <span className="truncate max-w-[100px]">{src.title || src.name || getHostname(src.url) || 'Source'}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <p className={typographyStyles.drawer.summary}>
          {post.summary}
        </p>
      </div>

      <div className="rounded-xl border border-rule/50 bg-paper-2/60 backdrop-blur-sm p-5 mb-7 shadow-sm">
        <h3 className={cn(typographyStyles.sectionHeading, "mb-3 flex items-center gap-2")}>
          <span aria-hidden="true" className="w-1 h-4 bg-accent" />
          Why this score?
        </h3>
        <p className="text-sm text-ink-soft leading-7">
          {post.credibility_reason}
        </p>
      </div>

      <div>
        <h3 className={cn(typographyStyles.sectionHeading, "mb-3 flex items-center gap-2")}>
          <ExternalLink className="w-4 h-4 text-accent" />
          Original Sources
        </h3>
        <SourceLinks sources={post.sources} />
      </div>

      <div className="mt-auto pt-12 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-3">
          <span className="block w-8 h-px bg-rule-strong" />
          <span className="block w-1.5 h-1.5 rounded-full bg-accent/60" />
          <span className="block w-8 h-px bg-rule-strong" />
        </div>
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-subtle">
          End of story
        </span>
      </div>

      {onSelectRelated && (
        <DrawerRelated currentPost={post} onSelect={onSelectRelated} />
      )}
    </article>
  );
}
