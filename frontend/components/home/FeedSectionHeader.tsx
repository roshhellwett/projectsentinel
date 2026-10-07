"use client";

import { useI18n } from "@/lib/i18n/i18n-shared";

export function FeedSectionHeader() {
  const { t } = useI18n();
  return (
    <div className="section-header-premium">
      <div>
        <span className="section-header-premium__mark">For your attention</span>
        <h2 className="font-display font-bold text-ink">
          {t("feed.your_feed")}
        </h2>
      </div>
      <span className="text-[10px] font-mono tracking-[0.16em] text-muted uppercase hidden sm:inline-block">
        Realtime synthesis / curated
      </span>
    </div>
  );
}
