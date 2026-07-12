"use client";

import { Z_INDEX } from "@/lib/theme/zIndex";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Post } from "@/types";
import { CategoryTag } from "./CategoryTag";
import { useI18n } from "@/lib/i18n/context";

interface NextStoryPromptProps {
  posts: Post[];
  currentPostId: string;
  hideNearSelector?: string;
}

export function NextStoryPrompt({
  posts,
  currentPostId,
  hideNearSelector = "#related-news",
}: NextStoryPromptProps) {
  const { t } = useI18n();
  const next = posts.find((p) => p.id !== currentPostId);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (
        sessionStorage.getItem(`iv:nextPrompt:dismissed:${currentPostId}`) ===
        "1"
      ) {
        setDismissed(true);
      }
    } catch {}
  }, [currentPostId]);

  useEffect(() => {
    if (!next || dismissed) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const viewport =
          window.innerHeight || document.documentElement.clientHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrolled = window.scrollY + viewport;
        const remaining = docHeight - scrolled;

        const hideNear = document.querySelector(
          hideNearSelector,
        ) as HTMLElement | null;
        let blockedByRelated = false;
        if (hideNear) {
          const rect = hideNear.getBoundingClientRect();
          blockedByRelated = rect.top < viewport - 80;
        }

        const reachedReadingEnd = scrolled > docHeight * 0.55;
        const nearBottom = remaining < 240;
        const nextVal = reachedReadingEnd && !blockedByRelated && !nearBottom;
        if (nextVal !== visibleRef.current) {
          visibleRef.current = nextVal;
          setVisible(nextVal);
        }
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [next, hideNearSelector, dismissed]);

  const onDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem(`iv:nextPrompt:dismissed:${currentPostId}`, "1");
    } catch {}
  };

  if (!next || dismissed) return null;

  return (
    <>
      {visible && (
        <div
          className={`animate-slide-up-fade fixed left-1/2 -translate-x-1/2 will-change-transform transform-gpu ${Z_INDEX.prompts}`}
          style={{
            width: "min(94vw,32rem)",
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 6rem)",
          }}
        >
          <div className="relative">
            <Link
              href={`/news/${next.id}/`}
              className="group relative flex items-center gap-3 rounded border border-rule/50 bg-paper/70 backdrop-blur-md pl-4 pr-12 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-3 top-[1px] h-px rounded-full bg-gradient-to-r from-transparent via-accent/40 to-transparent"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CategoryTag category={next.category} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                    {t("drawer.up_next")}
                  </span>
                </div>
                <p className="font-display text-[14.5px] font-semibold text-ink line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                  {next.headline}
                </p>
              </div>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/12 border border-accent/30 text-accent flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:bg-accent group-hover:text-white">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 6l7 7-7 7" />
                </svg>
              </span>
            </Link>
            <button
              type="button"
              onClick={onDismiss}
              aria-label={t("nextstory.aria_dismiss")}
              className="absolute -top-2.5 -right-2.5 inline-flex items-center justify-center w-8 h-8 rounded-full bg-paper/70 backdrop-blur-sm border border-rule/50 text-muted hover:text-ink hover:border-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.5 6.5l-11 11M6.5 6.5l11 11" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
