"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  TerminalSquare,
} from "lucide-react";
import { I18nContext } from "@/lib/i18n/i18n-shared";

export interface ErrorStateProps {
  /** The thrown error handed down by the Next.js error boundary. */
  error: Error & { digest?: string };
  /** Re-runs the failed render / segment. */
  reset?: () => void;
  /**
   * Plain-language description of what failed, e.g. "the front page".
   * Used to build the explanatory sentence.
   */
  context?: string;
  /** Optional label used for console grouping. */
  scope?: string;
}

/** Deterministic short code so a user can quote something back to support. */
function deriveCode(error: Error & { digest?: string }): string {
  if (error?.digest) return String(error.digest).slice(0, 8).toUpperCase();
  const seed = `${error?.name ?? "Error"}:${error?.message ?? ""}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(7, "0").slice(0, 7).toUpperCase();
}

/**
 * The single error surface used by every route boundary in the app.
 * Keeps the paper/ink editorial voice, always shows a quotable error code,
 * and hides the raw stack behind a disclosure.
 */
export default function ErrorState({
  error,
  reset,
  context = "this page",
  scope,
}: ErrorStateProps) {
  // useContext directly (not useI18n) so the component still renders when it is
  // mounted above the I18nProvider, e.g. during an early hydration failure.
  const i18n = useContext(I18nContext);
  const t = (key: string, fallback: string) => {
    if (!i18n) return fallback;
    const value = i18n.t(key);
    return !value || value === key ? fallback : value;
  };

  const [showDetails, setShowDetails] = useState(false);
  const code = deriveCode(error);

  useEffect(() => {
    console.error(`[${scope ?? "app"}] error:`, error);
  }, [error, scope]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-[70vh] flex flex-col items-center justify-center px-fluid-md py-fluid-xl text-center"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent-soft/50 border border-accent/20 flex items-center justify-center mb-fluid-md shrink-0">
        <AlertOctagon
          className="w-7 h-7 sm:w-8 sm:h-8 text-accent"
          strokeWidth={1.5}
        />
      </div>

      <p className="text-accent text-fluid-2xs font-bold tracking-[0.18em] uppercase mb-fluid-xs">
        {t("common.system_error", "System error")}
      </p>

      <h1 className="font-display text-fluid-3xl font-bold tracking-tight text-ink mb-fluid-sm leading-[1.05] max-w-narrow-fluid text-balance">
        {t("common.error_headline", "Sorry to disturb your reading")}
      </h1>

      <p className="text-muted max-w-narrow-fluid mb-fluid-sm text-fluid-base leading-relaxed">
        Something went wrong while loading {context}. The rest of the paper is
        still running — try again, or head back to the front page.
      </p>

      <p className="font-mono text-fluid-2xs tracking-[0.14em] text-subtle uppercase mb-fluid-lg">
        ERR &middot; {code}
      </p>

      <div className="flex flex-col sm:flex-row gap-fluid-xs w-full sm:w-auto max-w-xs sm:max-w-none">
        {reset && (
          <button
            onClick={reset}
            className="tap-target min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-token-sm border border-ink bg-ink text-paper text-fluid-sm font-semibold hover:bg-ink/90 transition-transform duration-base active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            {t("common.retry", "Try again")}
          </button>
        )}
        <Link
          href="/"
          className="tap-target min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-token-sm border border-rule-strong bg-paper text-ink text-fluid-sm font-semibold hover:border-ink hover:bg-paper-2 transition-transform duration-base active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Return to the front page
        </Link>
      </div>

      <div className="mt-fluid-xl w-full max-w-lg">
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="tap-target min-h-[44px] inline-flex items-center justify-center gap-2 text-fluid-xs font-semibold text-muted hover:text-ink transition-colors duration-fast px-3 py-1.5 rounded-token-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent w-full sm:w-auto mx-auto"
          aria-expanded={showDetails}
        >
          <TerminalSquare className="w-3.5 h-3.5 shrink-0" />
          {showDetails ? "Hide technical details" : "Show technical details"}
          {showDetails ? (
            <ChevronUp className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          )}
        </button>

        {showDetails && (
          <div className="mt-fluid-sm p-fluid-sm rounded-token-md glass-sm text-left overflow-x-auto">
            <p className="text-fluid-sm font-mono font-semibold text-ink mb-2 break-all">
              Error digest: {error?.digest || code}
            </p>
            <p className="text-fluid-xs font-mono text-muted whitespace-pre-wrap break-all">
              {error?.message || "Unknown error occurred"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
