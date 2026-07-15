"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { getScoreLabel } from "@/lib/utils/scoreColor";
import { useI18n } from "@/lib/i18n/context";

interface CredibilityBarProps {
  score: number;
  className?: string;
  compact?: boolean;
}

function clampScore(score: number) {
  return Math.min(
    100,
    Math.max(0, Number.isFinite(score) ? Math.round(score) : 0),
  );
}

export function CredibilityBar({
  score,
  className,
  compact = false,
}: CredibilityBarProps) {
  const { t } = useI18n();
  const clamped = clampScore(score);
  const label = getScoreLabel(clamped);

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimatedScore(clamped);
    }, 150);
    return () => clearTimeout(t);
  }, [clamped]);

  return (
    <div
      className={cn("w-full min-w-0 flex-shrink-0", className)}
      role="img"
      aria-label={`${t("credibility.score")}: ${clamped}/100, ${label}`}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3",
          compact ? "mb-1" : "mb-2",
        )}
      >
        <span
          className={cn(
            "truncate font-mono font-bold tracking-wider uppercase text-ink-soft",
            compact ? "text-[9px]" : "text-[11px]",
          )}
        >
          {compact ? label : `${t("credibility.score")} (${label})`}
        </span>
        <span
          className={cn(
            "flex-shrink-0 font-mono font-extrabold tabular-nums text-ink bg-ink/5 px-2 py-0.5 rounded border border-rule",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          {clamped}
          {!compact && <span className="font-normal text-ink-soft/80">/100</span>}
        </span>
      </div>

      <div className="relative w-full flex items-center py-1">
        <div
          className={cn("w-full overflow-hidden rounded-full border border-rule/80 shadow-inner", compact ? "h-2" : "h-3")}
          style={{ background: "rgb(var(--c-rule))" }}
        >
          <div
            className="h-full transition-[width] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full relative overflow-hidden"
            style={{
              width: `${animatedScore}%`,
              background: "rgb(var(--c-ink))",
            }}
            aria-hidden="true"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-paper/20 to-transparent animate-shimmer" />
          </div>
        </div>
        <div
          className={cn(
            "absolute top-1/2 pointer-events-none transition-[left] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm border-2 border-paper",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
          )}
          style={{
            left: `${animatedScore}%`,
            transform: "translate(-50%, -50%)",
            background: "rgb(var(--c-ink))",
            borderRadius: "50%",
          }}
        />
      </div>

      {!compact && (
        <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] font-semibold text-ink-soft/80 uppercase tracking-widest">
          <span>{t("credibility.low")}</span>
          <span>{t("credibility.moderate")}</span>
          <span>{t("credibility.high")}</span>
        </div>
      )}
    </div>
  );
}
