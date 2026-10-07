"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n/context";

interface VerificationStampProps { score: number; compact?: boolean; xsmall?: boolean; className?: string }

export function VerificationStamp({ score, compact, xsmall, className }: VerificationStampProps) {
  const { t } = useI18n();
  const level = score >= 90 ? "high" : score >= 70 ? "mid" : "low";
  return (
    <div className={cn("score-stamp", !compact && !xsmall && "!px-3 !py-1.5", className)} data-level={level} aria-label={`${t("credibility.score")} ${score}${compact || xsmall ? "%" : " percent"}`}>
      <Check size={12} strokeWidth={1.8} aria-hidden="true" />
      <span>{score}%</span>
      {!xsmall && <span className="score-stamp__label">{t(compact ? "verification.short" : "verification.full")}</span>}
    </div>
  );
}
