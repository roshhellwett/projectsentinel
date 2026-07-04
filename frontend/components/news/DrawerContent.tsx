import { Post } from '@/types';
import { ExternalLink } from 'lucide-react';
import { CorrectionsNotice } from './CorrectionsNotice';
import { CredibilityBar } from './CredibilityBar';
import { SourceLinks } from './SourceLinks';
import { DrawerRelated } from './DrawerRelated';
import { typographyStyles } from '@/lib/theme/typography';
import { cn } from '@/lib/utils/cn';

interface DrawerContentProps {
  post: Post;
  onSelectRelated?: (post: Post) => void;
}

export function DrawerContent({ post, onSelectRelated }: DrawerContentProps) {
  return (
    <article className={`article-drawer-scroll relative z-10 flex-1 overflow-y-auto overscroll-contain bg-paper px-5 pb-6 pt-5 sm:px-7 sm:pb-8 sm:pt-6 lg:px-8 lg:pt-10 lg:pb-10 flex flex-col ${post.status === 'retracted' ? 'opacity-50' : ''}`}>
      {post.status === 'corrected' && (
        <CorrectionsNotice type="corrected" note={post.correction_note} />
      )}
      {post.status === 'retracted' && (
        <CorrectionsNotice type="retracted" note={post.correction_note} />
      )}

      <h2 className={cn(typographyStyles.drawer.headline, "mb-5")}>
        {post.headline}
      </h2>

      <div className="mb-6 rounded border border-rule bg-paper-2 p-4 lg:p-3.5">
        <CredibilityBar score={post.credibility_score} />
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-rule pt-3">
          <span className={typographyStyles.kicker}>
            Verified Sources
          </span>
          <span className="text-sm font-semibold tabular-nums text-ink">
            {post.source_count} {post.source_count === 1 ? 'source' : 'sources'}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <p className={typographyStyles.drawer.summary}>
          {post.summary}
        </p>
      </div>

      <div className="rounded border border-rule bg-paper-2 p-5 mb-6">
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

      <div className="mt-auto pt-10 flex flex-col items-center text-center">
        <span aria-hidden="true" className="block w-10 h-px bg-rule-strong mb-3" />
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
