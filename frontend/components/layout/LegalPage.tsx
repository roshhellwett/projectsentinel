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
          className="tap-target min-h-[44px] inline-flex items-center gap-2 text-fluid-xs font-medium text-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group mb-fluid-md"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-rule/50 bg-paper/70 backdrop-blur-sm group-hover:border-ink transition-colors">
            <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </span>
          Back to all news
        </Link>

        <header className="mb-fluid-lg">
          <span
            aria-hidden="true"
            className="block w-10 sm:w-12 h-[2px] bg-accent rounded-full mb-fluid-sm"
          />
          <p className="editorial-kicker mb-fluid-xs">{kicker}</p>
          <h1 className="font-display text-fluid-2xl font-bold tracking-[-0.03em] text-ink leading-[1.08] mb-fluid-sm text-balance">
            {title}
          </h1>
          <p className="text-fluid-2xs font-semibold uppercase tracking-[0.18em] text-muted">
            Last updated · {lastUpdated}
          </p>
        </header>

        {intro && (
          <div className="legal-prose max-w-prose-fluid mb-fluid-lg text-fluid-md leading-[1.7] text-ink-soft">
            {intro}
          </div>
        )}

        <div className="legal-prose max-w-prose-fluid text-ink-soft">{children}</div>
      </PageShell>
    </div>
  );
}
