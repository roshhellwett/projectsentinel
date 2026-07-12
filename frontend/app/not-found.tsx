"use client";

import Link from "next/link";
import { ArrowLeft, FileQuestion, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-paper-2 border border-rule flex items-center justify-center mb-6">
        <FileQuestion
          className="w-8 h-8 md:w-10 md:h-10 text-muted"
          strokeWidth={1.5}
        />
      </div>

      <p className="text-accent text-[11px] font-bold tracking-[0.18em] uppercase mb-3">
        Error 404
      </p>
      <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-ink mb-4 leading-[1.05]">
        {t("not_found.title")}
      </h1>

      <p className="text-muted max-w-md mb-8 text-base leading-relaxed">
        {t("not_found.desc")}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Link
          href="/"
          className="tap-target min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded border border-ink bg-ink text-paper text-sm font-semibold hover:bg-ink/90 transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("not_found.back_home")}
        </Link>
        <Link
          href="/search"
          className="tap-target min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded border border-rule-strong bg-paper text-ink text-sm font-semibold hover:border-ink hover:bg-paper-2 transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Search className="w-4 h-4" />
          {t("not_found.search")}
        </Link>
      </div>
    </div>
  );
}
