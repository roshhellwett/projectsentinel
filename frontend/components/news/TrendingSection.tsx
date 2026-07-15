"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Post } from "@/types";
import { useReadPosts } from "@/lib/utils/readPosts";
import { useI18n } from "@/lib/i18n/context";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useHapticFeedback } from "@/lib/hooks/useHapticFeedback";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsDrawer } from "@/components/news/NewsDrawer";

function ArrowLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 6l-7 7 7 7" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 6l7 7-7 7" />
    </svg>
  );
}

interface TrendingSectionProps {
  posts: Post[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  const { t } = useI18n();
  const haptic = useHapticFeedback();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const trending = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    return posts.slice(0, 6);
  }, [posts]);

  const { isRead } = useReadPosts();
  const [hydrated, setHydrated] = useState(false);
  const [selected, setSelected] = useState<Post | null>(null);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const canScrollLeftRef = useRef(false);
  const canScrollRightRef = useRef(true);
  const tickingRef = useRef(false);

  const updateScrollState = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    requestAnimationFrame(() => {
      const el = carouselRef.current;
      if (el) {
        const left = el.scrollLeft > 8;
        const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 8;
        if (left !== canScrollLeftRef.current) {
          canScrollLeftRef.current = left;
          setCanScrollLeft(left);
        }
        if (right !== canScrollRightRef.current) {
          canScrollRightRef.current = right;
          setCanScrollRight(right);
        }
      }
      tickingRef.current = false;
    });
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  const scrollBy = useCallback((direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = direction === "left" ? -320 : 320;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  if (trending.length === 0) return null;

  return (
    <section aria-label={t("trending.title")} className="mb-8 sm:mb-12">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 pb-3 border-b-2 border-ink/40">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-2xs animate-pulse" />
          <h2 className="font-display font-bold text-lg sm:text-2xl text-ink tracking-tight">
            {t("trending.title")}
          </h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-mono text-[10px] sm:text-xs font-bold tracking-wider uppercase text-ink-soft bg-paper-2 px-2.5 py-1 rounded border border-rule">
            {t("trending.top_count", { n: trending.length })}
          </span>
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scrollBy("left")}
              disabled={!canScrollLeft}
              className="p-2 border border-rule/80 bg-paper-2 text-ink hover:bg-paper hover:border-ink disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 rounded-lg min-touch active:scale-95 shadow-2xs"
              aria-label={t("trending.aria_scroll_left")}
            >
              <ArrowLeft />
            </button>
            <button
              onClick={() => scrollBy("right")}
              disabled={!canScrollRight}
              className="p-2 border border-rule/80 bg-paper-2 text-ink hover:bg-paper hover:border-ink disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 rounded-lg min-touch active:scale-95 shadow-2xs"
              aria-label={t("trending.aria_scroll_right")}
            >
              <ArrowRight />
            </button>
          </div>
        </div>
      </div>

      <ErrorBoundary>
        <div
          ref={carouselRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 snap-x snap-mandatory overscroll-x-contain scroll-smooth no-scrollbar scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {trending.map((post, index) => {
            const read = hydrated && isRead(post.id);
            const rank = index + 1;

            return (
              <div
                key={post.id}
                className="flex-shrink-0 w-[85vw] sm:w-[350px] md:w-[370px] snap-start animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <NewsCard
                  post={post}
                  rank={rank}
                  onClick={() => setSelected(post)}
                  isRead={read}
                />
              </div>
            );
          })}
        </div>
      </ErrorBoundary>
      <NewsDrawer
        post={selected}
        onClose={() => setSelected(null)}
        onSelectRelated={(next) => setSelected(next)}
      />
    </section>
  );
}
