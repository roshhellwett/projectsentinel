"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Post } from "@/types";
import { useReadPosts } from "@/lib/utils/readPosts";
import { useI18n } from "@/lib/i18n/context";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
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
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const trending = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    return posts.slice(0, 6);
  }, [posts]);

  const { isRead, markRead } = useReadPosts();
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
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => { observer.disconnect(); el.removeEventListener("scroll", updateScrollState); };
  }, [updateScrollState, posts]);

  const scrollBy = useCallback((direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const step = (el.firstElementChild?.getBoundingClientRect().width ?? 320) + 20;
    el.scrollBy({ left: direction === "left" ? -step : step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, []);

  if (trending.length === 0) return null;

  return (
    <section aria-label={t("trending.title")} className="mb-fluid-lg">
      <div className="section-header-premium">
        <div>
          <span className="section-header-premium__mark">02 / Worth a closer look</span>
          <h2 className="font-display font-bold text-ink min-w-0 truncate">
            {t("trending.title")}
          </h2>
        </div>
        <div className="flex items-center gap-fluid-xs sm:gap-fluid-sm shrink-0">
          <span className="font-mono text-[9px] tracking-wider uppercase text-muted hidden sm:inline">
            {t("trending.top_count", { n: trending.length })}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollBy("left")}
              disabled={!canScrollLeft}
              className="icon-button disabled:opacity-30 disabled:pointer-events-none"
              aria-label={t("trending.aria_scroll_left")}
            >
              <ArrowLeft />
            </button>
            <button
              onClick={() => scrollBy("right")}
              disabled={!canScrollRight}
              className="icon-button disabled:opacity-30 disabled:pointer-events-none"
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
          className="flex gap-5 overflow-x-auto pb-5 pt-1 snap-x snap-mandatory overscroll-x-contain scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {trending.map((post, index) => {
            const read = hydrated && isRead(post.id);
            const rank = index + 1;

            return (
              <div
                key={post.id}
                className="flex-shrink-0 w-[min(82vw,340px)] lg:w-[calc((100%_-_2.5rem)/3)] snap-start"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <NewsCard
                  post={post}
                  rank={rank}
                  onClick={() => { markRead(post.id); setSelected(post); }}
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
        onSelectRelated={(next) => { markRead(next.id); setSelected(next); }}
      />
    </section>
  );
}
