"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Z_INDEX } from "@/lib/theme/zIndex";
import dynamic from "next/dynamic";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/utils/bodyScrollLock";
import { OPEN_SEARCH_EVENT } from "@/components/ui/KeyboardShortcuts";
import { useI18n } from "@/lib/i18n/i18n-shared";

const SearchBar = dynamic(
  () => import("@/components/ui/SearchBar").then((m) => m.SearchBar),
  { ssr: false },
);
import { ConnectionStatus } from "@/components/layout/ConnectionStatus";
import { LastRefreshed } from "@/components/layout/LastRefreshed";
import { LanguageFilter } from "@/components/layout/LanguageFilter";

const NAV_LINKS = [
  { href: "/category/politics/", labelKey: "nav.politics" },
  { href: "/category/business/", labelKey: "nav.business" },
  { href: "/category/sports/", labelKey: "nav.sports" },
  { href: "/category/tech/", labelKey: "nav.tech" },
  { href: "/category/world/", labelKey: "nav.world" },
  { href: "/saved/", labelKey: "nav.saved" },
  { href: "/how-it-works/", labelKey: "nav.how_it_works" },
] as const;

const REPO_URL = "https://github.com/roshhellwett/projectsentinel";

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.5 6.5l-11 11M6.5 6.5l11 11" />
    </svg>
  );
}

function BookmarkIcon() {
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
      <path d="M18 4v16l-6-5-6 5V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function GithubIcon() {
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
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isMobileOpen) return;
    lockBodyScroll();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    const normalize = (p: string) =>
      (p.endsWith("/") ? p.slice(0, -1) : p) || "/";
    const a = normalize(href);
    const b = normalize(pathname);
    if (a === "/") return b === "/";
    return b === a || b.startsWith(a + "/");
  };

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  useEffect(() => {
    const handler = () => setIsSearchOpen(true);
    window.addEventListener(OPEN_SEARCH_EVENT, handler);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, handler);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 inset-x-0 ${Z_INDEX.stickyNav} bg-paper/70 backdrop-blur-md border-b border-rule/50 transform-gpu select-none`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-[1600px] mx-auto w-full px-3 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-12 sm:h-14 lg:h-16">
            <Link
              href="/"
              prefetch={true}
              aria-label="India Verified — home"
              className="flex items-center gap-1.5 sm:gap-2.5 group rounded shrink min-w-0"
            >
              <span
                aria-hidden="true"
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 border border-ink text-ink font-display font-bold text-[13px] sm:text-[15px]"
              >
                IV
              </span>
              <span className="flex flex-col leading-none whitespace-nowrap">
                <span className="font-display text-base sm:text-xl text-ink truncate max-w-[130px] sm:max-w-none">
                  India Verified
                </span>
                <span className="hidden md:inline text-[11px] text-ink-soft font-body mt-0.5">
                  AI-cross-referenced Indian news
                </span>
              </span>
            </Link>

            <nav
              aria-label="Main navigation"
              className="hidden lg:flex items-center gap-1"
            >
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-flex items-center px-3.5 py-2 text-xs font-body transition-all rounded-sm ${
                      active
                        ? "text-ink bg-paper-2 border border-rule"
                        : "text-muted hover:text-ink border border-transparent hover:border-rule"
                    }`}
                  >
                    {link.labelKey === "nav.saved" && <BookmarkIcon />}
                    {t(link.labelKey)}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-2">
              <div className="hidden sm:inline">
                <LastRefreshed />
              </div>
              <ConnectionStatus />
              <LanguageFilter />

              <button
                type="button"
                onClick={openSearch}
                aria-label="Search articles (press /)"
                title="Search"
                className="text-muted hover:text-ink transition-colors p-2 sm:p-1.5 min-touch"
              >
                <SearchIcon />
              </button>

              <div className="hidden lg:block">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Source code on GitHub"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-ink border border-transparent hover:border-rule transition-all rounded-sm"
                >
                  <GithubIcon />
                  GitHub
                </a>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileOpen((v) => !v)}
                aria-label={isMobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileOpen}
                aria-controls="mobile-nav-drawer"
                className="lg:hidden text-muted hover:text-ink p-2 sm:p-1.5 rounded-sm min-touch"
              >
                {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`lg:hidden fixed inset-0 ${Z_INDEX.modalBackdrop} bg-ink/40 transition-opacity duration-200 ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        id="mobile-nav-drawer"
        className={`lg:hidden fixed top-0 right-0 bottom-0 ${Z_INDEX.drawerPanel} w-full max-w-sm bg-paper/80 backdrop-blur-xl border-l border-rule/50 flex flex-col overflow-x-hidden transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-rule">
          <span className="text-[10px] font-bold tracking-wider uppercase font-body text-ink-soft px-2">
            Sections
          </span>
          <button
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
            className="text-muted hover:text-ink p-1.5 rounded-sm"
          >
            <CloseIcon />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between px-3 min-h-[48px] border-b border-rule font-display text-base sm:text-lg transition-colors ${
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {link.labelKey === "nav.saved" && <BookmarkIcon />}
                  {t(link.labelKey)}
                </span>
                <ArrowRight />
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-rule flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-ink-soft font-body px-2">
              Language
            </span>
            <LanguageFilter />
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-rule text-sm text-ink hover:bg-paper-2 transition-all rounded-sm"
          >
            <GithubIcon />
            View source on GitHub
          </a>
        </div>
      </aside>

      <SearchBar isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  );
}
