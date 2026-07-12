import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";

interface LegalPageProps {
  kicker: string;
  title: string;
  lastUpdated: string;
  intro?: ReactNode;
  children: ReactNode;
}

export function LegalPage({
  kicker,
  title,
  lastUpdated,
  intro,
  children,
}: LegalPageProps) {
  return (
    <div className="relative min-h-screen">
      <PageShell narrow>
        <Link
          href="/"
          className="tap-target min-h-[44px] inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group mb-6 sm:mb-8"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-rule/50 bg-paper/70 backdrop-blur-sm group-hover:border-ink transition-colors">
            <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </span>
          Back to all news
        </Link>

        <header className="mb-6 sm:mb-10">
          <span
            aria-hidden="true"
            className="block w-10 sm:w-12 h-[2px] bg-accent rounded-full mb-4 sm:mb-5"
          />
          <p className="editorial-kicker mb-2 sm:mb-3">{kicker}</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold tracking-[-0.03em] text-ink leading-[1.1] sm:leading-[1.05] mb-3 sm:mb-4">
            {title}
          </h1>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Last updated · {lastUpdated}
          </p>
        </header>

        {intro && (
          <div className="legal-prose max-w-[68ch] mb-8 sm:mb-10 text-[15px] sm:text-[17px] leading-[1.7] text-ink-soft">
            {intro}
          </div>
        )}

        <div className="legal-prose max-w-[68ch] text-ink-soft">{children}</div>
      </PageShell>
    </div>
  );
}
