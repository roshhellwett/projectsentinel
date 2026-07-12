"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/i18n-shared";

const NEWS_LINKS = [
  { href: "/category/politics/", key: "nav.politics" },
  { href: "/category/business/", key: "nav.business" },
  { href: "/category/sports/", key: "nav.sports" },
  { href: "/category/tech/", key: "nav.tech" },
  { href: "/category/world/", key: "nav.world" },
  { href: "/category/entertainment/", key: "nav.entertainment" },
];

const ABOUT_LINKS = [
  { href: "/how-it-works/", key: "nav.how_it_works" },
  { href: "/saved/", key: "nav.saved" },
  { href: "/swipe/", key: "nav.swipe" },
];

const LEGAL_LINKS = [
  { href: "/privacy/", key: "footer.privacy" },
  { href: "/terms/", key: "footer.terms" },
  { href: "/corrections/", key: "footer.corrections" },
  { href: "/contact/", key: "footer.contact" },
];

function RssIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 11a9 9 0 019 9" />
      <path d="M4 4a16 16 0 0116 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

const REPO_URL = "https://github.com/roshhellwett/projectsentinel";
const RSS_URL = "/rss.xml";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-rule/50 overflow-x-hidden w-full max-w-full bg-paper/70 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 pt-8 sm:pt-10 pb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 sm:gap-6 pb-6 sm:pb-8 mb-6 sm:mb-8 border-b border-rule">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group rounded"
            >
              <span
                aria-hidden="true"
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border border-ink text-ink font-display font-bold text-sm sm:text-base"
              >
                IV
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-lg sm:text-xl text-ink">
                  India Verified
                </span>
                <span className="text-[11px] sm:text-xs text-ink-soft font-body">
                  AI-cross-referenced Indian news
                </span>
              </span>
            </Link>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-ink-soft leading-relaxed max-w-md">
              {t("footer.description")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={RSS_URL}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-2 border border-rule text-xs text-ink hover:bg-paper-2 transition-all rounded-sm min-h-[44px]"
            >
              <RssIcon />
              {t("footer.rss_feed")}
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-2 border border-rule text-xs text-ink hover:bg-paper-2 transition-all rounded-sm min-h-[44px]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
              </svg>
              {t("footer.github")}
              <ExternalLinkIcon />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-y-5 sm:gap-y-8 gap-x-4 sm:gap-x-10 mb-6 sm:mb-8">
          <div>
            <h3 className="font-body text-[10px] sm:text-xs font-bold tracking-wider uppercase text-ink-soft mb-2 sm:mb-4">
              {t("footer.news")}
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {NEWS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-soft hover:text-ink border-b border-transparent hover:border-ink transition-all text-sm py-2 inline-block min-h-[44px] flex items-center"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-body text-[10px] sm:text-xs font-bold tracking-wider uppercase text-ink-soft mb-2 sm:mb-4">
              {t("footer.about")}
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {ABOUT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-soft hover:text-ink border-b border-transparent hover:border-ink transition-all text-sm py-2 inline-block min-h-[44px] flex items-center"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-body text-[10px] sm:text-xs font-bold tracking-wider uppercase text-ink-soft mb-2 sm:mb-4">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-soft hover:text-ink border-b border-transparent hover:border-ink transition-all text-sm py-2 inline-block min-h-[44px] flex items-center"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-body text-[10px] sm:text-xs font-bold tracking-wider uppercase text-ink-soft mb-2 sm:mb-4">
              {t("footer.transparency")}
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              <li className="flex items-start gap-2 text-ink-soft text-sm leading-snug">
                <span
                  className="mt-2 w-1.5 h-px bg-ink-soft flex-shrink-0"
                  aria-hidden="true"
                />
                <span>No advertising or sponsored content</span>
              </li>
              <li className="flex items-start gap-2 text-ink-soft text-sm leading-snug">
                <span
                  className="mt-2 w-1.5 h-px bg-ink-soft flex-shrink-0"
                  aria-hidden="true"
                />
                <span>Every claim links back to its sources</span>
              </li>
              <li className="flex items-start gap-2 text-ink-soft text-sm leading-snug">
                <span
                  className="mt-2 w-1.5 h-px bg-ink-soft flex-shrink-0"
                  aria-hidden="true"
                />
                <span>Open-source under the MIT licence</span>
              </li>
              <li className="flex items-start gap-2 text-ink-soft text-sm leading-snug">
                <span
                  className="mt-2 w-1.5 h-px bg-ink-soft flex-shrink-0"
                  aria-hidden="true"
                />
                <span>AI cross-verifies before publishing</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse md:items-center md:justify-between gap-2 sm:gap-4 pt-3 sm:pt-6 border-t border-rule">
          <p className="text-[10px] sm:text-xs text-muted leading-relaxed">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-paper-2 border border-rule text-[10px] sm:text-xs">
              <span className="font-semibold text-ink-soft">
                {t("footer.built_in_india")}
              </span>
            </span>
            <span aria-hidden="true" className="mx-1 text-rule">
              ·
            </span>
            Designed &amp; engineered by{" "}
            <a
              href="https://github.com/roshhellwett"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline decoration-rule underline-offset-2"
            >
              Roshhellwett
            </a>
          </p>
          <p
            className="text-[10px] sm:text-xs text-muted leading-relaxed"
            suppressHydrationWarning
          >
            &copy; {year} India Verified. MIT licence.
          </p>
        </div>
      </div>
    </footer>
  );
}
