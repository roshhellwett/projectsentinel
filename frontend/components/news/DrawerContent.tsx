'use client';

import { Post, Source } from '@/types';
import { memo, useState } from 'react';
import { ExternalLink, Globe, ShieldCheck, Info } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-shared';
import { CorrectionsNotice } from './CorrectionsNotice';
import { CredibilityBar } from './CredibilityBar';
import { SourceLinks } from './SourceLinks';
import { DrawerRelated } from './DrawerRelated';
import { LanguageBadge } from '@/components/ui/LanguageBadge';
import { typographyStyles } from '@/lib/theme/typography';
import { cn } from '@/lib/utils/cn';
import { getHostname } from '@/lib/utils/getHostname';
import { motion, Variants } from 'framer-motion';

const SourceFaviconChip = memo(function SourceFaviconChip({ source }: { source: Source }) {
  const [errored, setErrored] = useState(false);
  const host = getHostname(source.url);
  if (!host || errored) {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-paper-2 border border-rule/50 text-subtle flex-shrink-0">
        <Globe className="w-3 h-3" />
      </span>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`}
      alt=""
      width={20}
      height={20}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      sizes="20px"
      className="w-5 h-5 rounded-md flex-shrink-0 bg-paper-2 border border-rule/50 shadow-sm"
    />
  );
});

interface DrawerContentProps {
  post: Post;
  onSelectRelated?: (post: Post) => void;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function DrawerContent({ post, onSelectRelated }: DrawerContentProps) {
  const { t } = useI18n();

  return (
    <article className={cn(
      "article-drawer-scroll relative z-10 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-6 sm:px-8 sm:pb-10 sm:pt-7 lg:px-10 lg:pt-12 lg:pb-12 flex flex-col",
      post.status === 'retracted' && "opacity-50"
    )}>
      {/* Decorative background blobs for premium feel */}
      <div className="absolute top-0 right-[-20%] w-[60%] h-64 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] left-[-20%] w-[50%] h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="relative z-10 flex flex-col flex-1"
      >
        {post.status === 'corrected' && (
          <motion.div variants={itemVariants}>
            <CorrectionsNotice type="corrected" note={post.correction_note} />
          </motion.div>
        )}
        {post.status === 'retracted' && (
          <motion.div variants={itemVariants}>
            <CorrectionsNotice type="retracted" note={post.correction_note} />
          </motion.div>
        )}

        <motion.h2
          variants={itemVariants}
          className={cn(typographyStyles.drawer.headline, "mb-5 drop-shadow-sm")}
        >
          {post.headline}
        </motion.h2>

        {post.language && post.language !== 'en' && (
          <motion.div variants={itemVariants} className="mb-5">
            <LanguageBadge language={post.language} />
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="mb-8 relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-br from-accent/20 to-transparent rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
          <div className="relative rounded-2xl border border-white/30 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-md p-5 lg:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <CredibilityBar score={post.credibility_score} />
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-rule/50 pt-4">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span className={cn(typographyStyles.kicker, "text-accent")}>
                  {t('drawer.verified_sources')}
                </span>
              </div>
              <span className="text-sm font-bold tabular-nums text-ink bg-accent/10 px-2.5 py-0.5 rounded-full">
                {(post.source_count ?? (post.sources?.length || 0))} {(post.source_count ?? (post.sources?.length || 0)) === 1 ? t('drawer.source') : t('drawer.sources')}
              </span>
            </div>
            {post.sources && post.sources.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-rule/30">
                {post.sources.slice(0, 5).map((src, i) => (
                  <a
                    key={src.url || i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-paper-2 hover:bg-paper border border-rule/50 text-[12px] font-medium text-ink-soft hover:text-ink hover:border-rule transition-all rounded-lg hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group/link"
                    aria-label={`Open source: ${src.title || src.name || getHostname(src.url)} (opens in new tab)`}
                  >
                    <SourceFaviconChip source={src} />
                    <span className="truncate max-w-[120px]">{src.title || src.name || getHostname(src.url) || 'Source'}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <div className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-md p-6 lg:p-7 shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative overflow-hidden group transition-all hover:bg-white/30 dark:hover:bg-black/30">
            {/* Accent Line inside the card to fix the floating bug */}
            <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-accent to-accent/30" />

            <div className="absolute -top-4 -right-4 text-ink opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none transform -rotate-12 scale-150">
              <span className="font-serif text-9xl">&quot;</span>
            </div>

            <div className="relative z-10">
              <p className={cn(typographyStyles.drawer.summary, "text-[17px] lg:text-[18.5px] leading-[1.85] text-ink/90 font-serif italic tracking-wide")}>
                {post.summary}
              </p>

              <div className="mt-5 flex justify-end items-center gap-2 opacity-90">
                <span className="block w-6 h-px bg-ink-soft/40" />
                <span className="font-serif italic text-[14.5px] text-ink-soft">
                  Verified by <span className="font-semibold text-accent text-[15px]">Groq</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-md p-5 lg:p-6 mb-8 relative overflow-hidden group hover:border-white/40 dark:hover:border-white/20 transition-colors shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-accent/80 transition-all group-hover:bg-accent" />
          <h3 className={cn(typographyStyles.sectionHeading, "mb-3 flex items-center gap-2 text-ink")}>
            <Info className="w-4 h-4 text-accent" />
            {t('drawer.why_score')}
          </h3>
          <p className="text-[15px] text-ink-soft leading-relaxed">
            {post.credibility_reason}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-10">
          <h3 className={cn(typographyStyles.sectionHeading, "mb-4 flex items-center gap-2")}>
            <ExternalLink className="w-4 h-4 text-muted" />
            {t('drawer.original_sources')}
          </h3>
          <SourceLinks sources={post.sources} />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-auto pt-8 flex flex-col items-center text-center pb-4">
          <div className="flex items-center gap-3 mb-4 opacity-50">
            <span className="block w-12 h-px bg-gradient-to-r from-transparent to-rule-strong" />
            <span className="block w-1.5 h-1.5 rounded-full bg-muted" />
            <span className="block w-12 h-px bg-gradient-to-l from-transparent to-rule-strong" />
          </div>
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-muted/60">
            {t('drawer.end_of_story')}
          </span>
        </motion.div>

        {onSelectRelated && (
          <motion.div variants={itemVariants}>
            <DrawerRelated currentPost={post} onSelect={onSelectRelated} />
          </motion.div>
        )}
      </motion.div>
    </article>
  );
}
