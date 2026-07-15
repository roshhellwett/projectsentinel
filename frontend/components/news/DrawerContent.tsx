"use client";

import { Post } from "@/types";
import { ExternalLink, ShieldCheck, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-shared";
import { CorrectionsNotice } from "./CorrectionsNotice";
import { CredibilityBar } from "./CredibilityBar";
import { SourceLinks } from "./SourceLinks";
import { DrawerRelated } from "./DrawerRelated";
import { LanguageBadge } from "@/components/ui/LanguageBadge";
import { typographyStyles } from "@/lib/theme/typography";
import { cn } from "@/lib/utils/cn";

interface DrawerContentProps {
  post: Post;
  onSelectRelated?: (post: Post) => void;
}

export function DrawerContent({ post, onSelectRelated }: DrawerContentProps) {
  const { t } = useI18n();

  return (
    <article
      className={cn(
        "article-drawer-scroll relative z-10 flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full overscroll-contain px-4 pb-6 pt-3 sm:px-8 sm:pb-12 sm:pt-6 lg:px-10 lg:pt-8 lg:pb-16 flex flex-col",
        post.status === "retracted" && "opacity-50",
      )}
    >
      <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">
        {post.status === "corrected" && (
          <CorrectionsNotice type="corrected" note={post.correction_note} />
        )}
        {post.status === "retracted" && (
          <CorrectionsNotice type="retracted" note={post.correction_note} />
        )}

        <h2 className="font-display font-[900] text-[clamp(1.5rem,4.5vw,2.4rem)] leading-[1.08] tracking-[-0.025em] text-ink mb-5 drop-shadow-2xs">
          {post.headline}
        </h2>

        {post.language && post.language !== "en" && (
          <div className="mb-5">
            <LanguageBadge language={post.language} />
          </div>
        )}

        <div className="mb-8 p-4 sm:p-5 rounded-2xl border-2 border-ink/80 bg-paper-2/80 glass-card shadow-2xs">
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono text-[11px] font-extrabold uppercase tracking-widest text-ink">
              {t("drawer.verified_sources")}
            </span>
            <span className="ml-auto font-mono text-xs font-bold text-ink bg-paper px-2.5 py-0.5 rounded border border-rule shadow-2xs">
              {post.source_count ?? (post.sources?.length || 0)}{" "}
              {(post.source_count ?? (post.sources?.length || 0)) === 1
                ? t("drawer.source")
                : t("drawer.sources")}
            </span>
          </div>
          <CredibilityBar score={post.credibility_score} />
        </div>

        <div className="mb-8">
          <p className="font-body text-[16px] sm:text-[18.5px] leading-[1.75] text-ink-soft font-normal">
            {post.summary}
          </p>
          <div className="flex justify-end items-center gap-2.5 mt-6 pt-4 border-t border-rule/50">
            <span className="block w-8 h-px bg-rule-strong" />
            <span className="font-mono font-bold text-xs tracking-wider uppercase text-ink-soft/80">
              Cross-verified by AI synthesis
            </span>
          </div>
        </div>

        <div className="mb-8 p-4 sm:p-5 rounded-2xl border border-rule bg-paper-2/60">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink flex items-center gap-2 mb-2.5">
            <Info className="w-4 h-4 text-ink" />
            {t("drawer.why_score")}
          </h3>
          <p className="font-body text-sm text-ink-soft leading-relaxed">
            {post.credibility_reason}
          </p>
        </div>

        <div className="mb-12">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink flex items-center gap-2 mb-3.5">
            <ExternalLink className="w-4 h-4 text-ink" />
            {t("drawer.original_sources")}
          </h3>
          <SourceLinks sources={post.sources} />
        </div>

        <div className="mt-auto pt-8 flex flex-col items-center text-center pb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="block w-10 h-px bg-rule" />
            <span className="font-mono font-bold text-ink-soft text-xs tracking-[0.3em]">
              -30-
            </span>
            <span className="block w-10 h-px bg-rule" />
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-ink-soft/60">
            {t("drawer.end_of_story")}
          </span>
        </div>

        {onSelectRelated && (
          <div className="mt-6 pt-6 border-t-2 border-rule">
            <DrawerRelated currentPost={post} onSelect={onSelectRelated} />
          </div>
        )}
      </div>
    </article>
  );
}
