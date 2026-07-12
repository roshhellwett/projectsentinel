"use client";

import { useI18n } from "@/lib/i18n/i18n-shared";

export function FeedSectionHeader() {
  const { t } = useI18n();
  return (
    <div className="mb-3 sm:mb-6 pb-2 sm:pb-4 border-b border-rule">
      <h2 className="font-body font-bold text-base sm:text-xl text-ink">
        {t("feed.your_feed")}
      </h2>
    </div>
  );
}
