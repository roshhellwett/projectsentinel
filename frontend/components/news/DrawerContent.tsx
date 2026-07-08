'use client';

import { Post } from '@/types';
import { ExternalLink, ShieldCheck, Info } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-shared';
import { CorrectionsNotice } from './CorrectionsNotice';
import { CredibilityBar } from './CredibilityBar';
import { SourceLinks } from './SourceLinks';
import { DrawerRelated } from './DrawerRelated';
import { LanguageBadge } from '@/components/ui/LanguageBadge';
import { typographyStyles } from '@/lib/theme/typography';
import { cn } from '@/lib/utils/cn';

interface DrawerContentProps {
  post: Post;
  onSelectRelated?: (post: Post) => void;
}

export function DrawerContent({ post, onSelectRelated }: DrawerContentProps) {
  const { t } = useI18n();

  return (
    <article className={cn(
      "article-drawer-scroll relative z-10 flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full overscroll-contain px-4 pb-4 pt-3 sm:px-8 sm:pb-10 sm:pt-5 lg:px-10 lg:pt-6 lg:pb-14 flex flex-col",
      post.status === 'retracted' && "opacity-50"
    )}>
      <div className="flex flex-col flex-1 max-w-3xl">
        {post.status === 'corrected' && <CorrectionsNotice type="corrected" note={post.correction_note} />}
        {post.status === 'retracted' && <CorrectionsNotice type="retracted" note={post.correction_note} />}

        <h2 className={cn(typographyStyles.drawer.headline, "text-ink mb-4")}>
          {post.headline}
        </h2>

        {post.language && post.language !== 'en' && (
          <div className="mb-4"><LanguageBadge language={post.language} /></div>
        )}

        <div className="mb-6 py-4 border-y border-rule">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-cred-high" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{t('drawer.verified_sources')}</span>
            <span className="ml-auto text-xs font-semibold text-ink tabular-nums">
              {(post.source_count ?? (post.sources?.length || 0))} {(post.source_count ?? (post.sources?.length || 0)) === 1 ? t('drawer.source') : t('drawer.sources')}
            </span>
          </div>
          <CredibilityBar score={post.credibility_score} />
        </div>

        <div className="mb-6">
          <p className="text-base sm:text-[17px] leading-[1.8] text-ink-soft font-serif italic">
            {post.summary}
          </p>
          <div className="flex justify-end items-center gap-2 mt-4">
            <span className="block w-6 h-px bg-rule-strong" />
            <span className="font-serif italic text-sm text-muted">Cross-verified by AI analysis</span>
          </div>
        </div>

        <div className="mb-6 py-4 border-y border-rule">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-ink flex items-center gap-2 mb-2">
            <Info className="w-3.5 h-3.5 text-accent" />
            {t('drawer.why_score')}
          </h3>
          <p className="text-sm text-ink-soft leading-relaxed">
            {post.credibility_reason}
          </p>
        </div>

        <div className="mb-10">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-ink flex items-center gap-2 mb-3">
            <ExternalLink className="w-3.5 h-3.5 text-muted" />
            {t('drawer.original_sources')}
          </h3>
          <SourceLinks sources={post.sources} />
        </div>

        <div className="mt-auto pt-8 flex flex-col items-center text-center pb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="block w-8 h-px bg-rule" />
            <span className="font-serif font-bold text-muted text-xs tracking-[0.3em]">-30-</span>
            <span className="block w-8 h-px bg-rule" />
          </div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted/60">
            {t('drawer.end_of_story')}
          </span>
        </div>

        {onSelectRelated && (
          <div className="mt-6 pt-6 border-t border-rule">
            <DrawerRelated currentPost={post} onSelect={onSelectRelated} />
          </div>
        )}
      </div>
    </article>
  );
}
