"use client";

import { useEffect, useState } from "react";
import { Post } from "@/types";
import { VerificationStamp } from "@/components/ui/VerificationStamp";
import { useTimeAgo } from "@/lib/hooks/useTimeAgo";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface DrawerRelatedProps {
  currentPost: Post;
  onSelect: (post: Post) => void;
}

export function DrawerRelated({ currentPost, onSelect }: DrawerRelatedProps) {
  const { t } = useI18n();
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    const ctrl = new AbortController();
    const params = new URLSearchParams({
      page: "1",
      limit: "8",
      category: currentPost.category || "",
    });
    fetch(`/api/posts/?${params.toString()}`, {
      signal: ctrl.signal,
      cache: "no-store",
    })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error("Failed to fetch related")),
      )
      .then(async (payload: { posts: Post[] }) => {
        if (cancelled) return;
        let filtered = (payload.posts ?? []).filter(
          (p) => p.id !== currentPost.id,
        );

        if (filtered.length < 3 && !cancelled) {
          try {
            const fallbackRes = await fetch("/api/posts/?limit=10", {
              signal: ctrl.signal,
              cache: "no-store",
            });
            if (fallbackRes.ok) {
              const fallbackPayload = await fallbackRes.json();
              const more = (fallbackPayload.posts ?? []).filter(
                (p: Post) =>
                  p.id !== currentPost.id &&
                  !filtered.some((f) => f.id === p.id),
              );
              filtered = [...filtered, ...more];
            }
          } catch {}
        }

        if (cancelled) return;
        setRelated(filtered.slice(0, 3));
      })
      .catch((err) => {
        if (cancelled || err?.name === "AbortError") return;
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [currentPost.id, currentPost.category]);

  if (!loading && related.length === 0 && !error) return null;

  return (
    <section className="mt-8 border-t border-rule pt-6">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5 pb-3 border-b-2 border-ink/40">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-ink inline-block shadow-2xs" />
          <h3 className="font-display font-bold text-lg sm:text-xl text-ink tracking-tight">
            {t("drawer.keep_reading")}
          </h3>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[104px] rounded-[16px] border-2 border-ink/40 bg-paper-2 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-[13px] text-muted py-4 text-center">
          {t("drawer.related_error")}
        </p>
      ) : (
        <ul className="space-y-3">
          {related.map((post, i) => (
            <li
              key={post.id}
              className="animate-slide-up"
              style={{
                animationDelay: `${i * 40}ms`,
                animationFillMode: "both",
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(post)}
                className="group relative flex w-full flex-col justify-between gap-2.5 rounded-[16px] border-2 border-ink bg-paper p-4 text-left shadow-[3px_3px_0px_rgb(var(--c-ink))] transition-all duration-200 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_rgb(var(--c-ink))] active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1.5px_1.5px_0px_rgb(var(--c-ink))] focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 min-h-[90px]"
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-ink bg-paper/80 px-2 py-0.5 rounded border border-rule/70 shadow-2xs">
                      {post.category}
                    </span>
                    <span className="text-ink-soft/40" aria-hidden="true">
                      ·
                    </span>
                    <span
                      className="font-mono text-[10px] sm:text-[11px] text-ink-soft"
                      suppressHydrationWarning
                    >
                      {useTimeAgo(post.published_at)}
                    </span>
                  </div>
                  <VerificationStamp score={post.credibility_score} compact />
                </div>
                <div className="flex w-full items-start justify-between gap-3 mt-1">
                  <p className="font-display font-[800] text-[15px] sm:text-[16px] leading-[1.25] tracking-[-0.015em] text-ink line-clamp-2 group-hover:text-ink/90 transition-colors flex-1">
                    {post.headline}
                  </p>
                  <ArrowUpRight
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-soft transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                    aria-hidden="true"
                  />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
