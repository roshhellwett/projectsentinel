"use client";

import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n/context";

interface VerificationStampProps {
  score: number;
  compact?: boolean;
  xsmall?: boolean;
  className?: string;
}

function CheckIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function VerificationStamp({
  score,
  compact,
  xsmall,
  className,
}: VerificationStampProps) {
  const { t } = useI18n();
  if (xsmall) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-rule/80 bg-paper-2/80 text-ink font-mono font-bold text-[10px] leading-none shadow-2xs",
          className,
        )}
        aria-label={t("credibility.score") + ` ${score}%`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
        <CheckIcon />
        <span>{score}%</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-rule/80 bg-paper-2/80 text-ink shadow-2xs",
          className,
        )}
        aria-label={t("credibility.score") + ` ${score}%`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
        <CheckIcon />
        <span className="font-mono font-bold text-xs leading-none">{score}%</span>
        <span className="font-mono text-[9px] font-extrabold tracking-widest uppercase text-ink-soft leading-none">
          {t("verification.short")}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rule bg-paper-2/90 text-ink shadow-sm glass",
        className,
      )}
      aria-label={t("credibility.score") + ` ${score} percent`}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
      <CheckIcon />
      <span className="font-mono text-sm leading-none font-bold">
        {score}%
      </span>
      <span className="font-mono text-[10px] font-extrabold tracking-widest uppercase text-ink-soft leading-none">
        {t("verification.full")}
      </span>
    </div>
  );
}
