"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { EditorialIllustration } from "@/components/visual/EditorialIllustration";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-fluid-md py-fluid-xl text-center">
      <EditorialIllustration variant="search" className="!max-w-[240px] mb-3" />

      <p className="text-accent text-fluid-2xs font-bold tracking-[0.18em] uppercase mb-fluid-xs">
        Error 404
      </p>
      <h1 className="font-display text-fluid-3xl font-bold tracking-tight text-ink mb-fluid-sm leading-[1.05] max-w-narrow-fluid text-balance">
        {t("not_found.title")}
      </h1>

      <p className="text-muted max-w-narrow-fluid mb-fluid-lg text-fluid-base leading-relaxed">
        {t("not_found.desc")}
      </p>

      <div className="flex flex-col sm:flex-row gap-fluid-xs w-full sm:w-auto max-w-xs sm:max-w-none">
        <Link
          href="/"
          className="editorial-button"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("not_found.back_home")}
        </Link>
        <Link
          href="/search"
          className="tap-target min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-token-sm border border-rule-strong bg-paper text-ink text-fluid-sm font-semibold hover:border-ink hover:bg-paper-2 transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Search className="w-4 h-4" />
          {t("not_found.search")}
        </Link>
      </div>
    </div>
  );
}
