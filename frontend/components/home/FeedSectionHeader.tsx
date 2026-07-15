"use client";

import { useI18n } from "@/lib/i18n/i18n-shared";

export function FeedSectionHeader() {
  const { t } = useI18n();
  return (
    <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-ink/40 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-ink inline-block shadow-2xs" />
        <h2 className="font-display font-bold text-lg sm:text-2xl text-ink tracking-tight">
          {t("feed.your_feed")}
        </h2>
      </div>
      <span className="text-[11px] font-mono tracking-widest text-ink-soft uppercase hidden sm:inline-block">
        Realtime Synthesis
      </span>
    </div>
  );
}
