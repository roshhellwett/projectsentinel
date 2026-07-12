"use client";

import { useCallback, useState } from "react";
import { useSavedPosts } from "@/lib/utils/readPosts";
import { showToast } from "@/lib/utils/toast";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { useHapticFeedback } from "@/lib/hooks/useHapticFeedback";
import { useI18n } from "@/lib/i18n/context";

interface BookmarkButtonProps {
  postId: string;
  variant?: "icon" | "pill";
  stopPropagation?: boolean;
  className?: string;
}

export function BookmarkButton({
  postId,
  variant = "icon",
  stopPropagation = true,
  className,
}: BookmarkButtonProps) {
  const { t } = useI18n();
  const haptic = useHapticFeedback();
  const { isSaved, toggleSaved } = useSavedPosts();
  const saved = isSaved(postId);
  const [showParticles, setShowParticles] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
      }
      const nextSaved = !saved;
      if (nextSaved) {
        haptic.medium();
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 500);
      } else {
        haptic.light();
      }
      toggleSaved(postId);
      showToast(
        nextSaved ? t("bookmark.toast_save") : t("bookmark.toast_unsave"),
        nextSaved ? "bookmark" : "bookmark-off",
      );
    },
    [postId, toggleSaved, stopPropagation, saved, haptic, t],
  );

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? t("bookmark.aria_unsave") : t("bookmark.aria_save")}
        className={cn(
          buttonVariants({ variant: saved ? "secondary" : "outline" }),
          "relative tap-target gap-2 px-4 py-2 rounded-xl font-bold shadow-sm transition-all duration-200 active:scale-95",
          saved
            ? "bg-accent/10 border-accent text-accent hover:bg-accent/15"
            : "text-muted border-rule hover:border-ink hover:bg-paper-2 hover:text-ink",
          className,
        )}
      >
        {showParticles && (
          <span className="absolute inset-0 pointer-events-none overflow-visible">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full pointer-events-none animate-fade-in"
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: [
                    "#0057b3",
                    "#008a5e",
                    "#b8860b",
                    "#c41e3a",
                    "#0284c7",
                    "#d97706",
                  ][i % 6],
                  left: "50%",
                  top: "50%",
                  marginLeft: -2,
                  marginTop: -2,
                  animation: `particleBurst 0.45s ease-out forwards`,
                  animationDelay: `${i * 20}ms`,
                  ["--tx" as string]: `${Math.cos((i / 6) * 360 * (Math.PI / 180)) * (16 + Math.random() * 12)}px`,
                  ["--ty" as string]: `${Math.sin((i / 6) * 360 * (Math.PI / 180)) * (16 + Math.random() * 12)}px`,
                }}
              />
            ))}
          </span>
        )}

        <span className="flex items-center gap-2">
          {saved ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 4v16l-6-5-6 5V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z" />
              <path d="M15 4l-3 2-3-2" />
            </svg>
          ) : (
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
              <path d="M18 4v16l-6-5-6 5V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z" />
            </svg>
          )}
          <span>{saved ? t("bookmark.saved_label") : t("common.save")}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? t("bookmark.aria_unsave") : t("bookmark.aria_save")}
      className={cn(
        "group relative tap-target min-w-[44px] min-h-[44px] flex items-center justify-center p-2 -m-2 rounded-full transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-90",
        saved ? "text-accent" : "text-subtle hover:text-ink hover:bg-ink/5",
        className,
      )}
    >
      {showParticles && (
        <span className="absolute inset-0 pointer-events-none overflow-visible">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 4,
                height: 4,
                backgroundColor: [
                  "#0057b3",
                  "#008a5e",
                  "#b8860b",
                  "#c41e3a",
                  "#0284c7",
                  "#d97706",
                ][i % 6],
                left: "50%",
                top: "50%",
                marginLeft: -2,
                marginTop: -2,
                animation: `particleBurst 0.45s ease-out forwards`,
                animationDelay: `${i * 20}ms`,
                ["--tx" as string]: `${Math.cos((i / 6) * 360 * (Math.PI / 180)) * (16 + Math.random() * 12)}px`,
                ["--ty" as string]: `${Math.sin((i / 6) * 360 * (Math.PI / 180)) * (16 + Math.random() * 12)}px`,
              }}
            />
          ))}
        </span>
      )}

      {saved ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 4v16l-6-5-6 5V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z" />
          <path d="M15 4l-3 2-3-2" />
        </svg>
      ) : (
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
          <path d="M18 4v16l-6-5-6 5V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z" />
        </svg>
      )}

      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-ink px-2.5 py-1 text-[10px] font-bold text-paper opacity-0 transition-all group-hover:opacity-100 group-focus-visible:opacity-100 scale-95 group-hover:scale-100">
        {saved ? t("bookmark.tooltip_unsave") : t("bookmark.tooltip_save")}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-[4px] border-transparent border-t-ink" />
      </span>
    </button>
  );
}
