"use client";

import { Flame, Layers, Undo2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface SwipeProgressProps {
  consumedToday: number;
  remaining: number;
  streak: number;
  canRewind: boolean;
  onRewind: () => void;
}

export function SwipeProgress({
  consumedToday,
  remaining,
  streak,
  canRewind,
  onRewind,
}: SwipeProgressProps) {
  const { t } = useI18n();
  return (
    <div
      className="w-full max-w-md mx-auto px-4 mb-2"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-3 text-muted">
          <span className="inline-flex items-center gap-1 font-medium">
            <Layers className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
            <span className="tabular-nums text-ink">{consumedToday}</span>
            <span>{t("swipe.read_today")}</span>
          </span>
          {streak > 1 && (
            <span
              className="inline-flex items-center gap-1 font-medium"
              title={t("swipe.streak_days", { n: streak })}
            >
              <Flame
                className="w-3 h-3 text-accent"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="tabular-nums text-ink">{streak}</span>
              <span>{t("swipe.streak_days", { n: streak })}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-muted">
          {remaining > 0 && (
            <span className="font-medium tabular-nums">
              {t("swipe.remaining", { n: remaining })}
            </span>
          )}
          <button
            type="button"
            onClick={onRewind}
            disabled={!canRewind}
            className="tap-target min-h-[44px] inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink disabled:text-subtle disabled:cursor-not-allowed hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-3"
            aria-label={t("swipe.aria_back")}
          >
            <Undo2 className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
            {t("swipe.back")}
          </button>
        </div>
      </div>
    </div>
  );
}
