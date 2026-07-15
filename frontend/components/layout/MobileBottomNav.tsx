"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { useI18n } from "@/lib/i18n/i18n-shared";
import { CATEGORIES } from "@/lib/constants/categories";
import { OPEN_SEARCH_EVENT } from "@/components/ui/KeyboardShortcuts";
import {
  lockBodyScroll,
  unlockBodyScroll,
  subscribeBodyScrollLock,
  isBodyScrollLocked,
} from "@/lib/utils/bodyScrollLock";
import { Z_INDEX } from "@/lib/theme/zIndex";

function HomeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function SwipeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
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

function TopicsIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg
      width="22"
      height="22"
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

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
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

const TABS = [
  { id: "home", href: "/", icon: HomeIcon, key: "nav.home" },
  { id: "swipe", href: "/swipe/", icon: SwipeIcon, key: "nav.swipe" },
  { id: "search", href: null, icon: SearchIcon, key: "nav.search" },
  { id: "topics", href: null, icon: TopicsIcon, key: "nav.topics" },
  { id: "saved", href: "/saved/", icon: BookmarkIcon, key: "nav.saved" },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);

  const closeTopics = useCallback(() => setTopicsOpen(false), []);
  const toggleTopics = useCallback(() => setTopicsOpen((v) => !v), []);

  useEffect(() => {
    if (!topicsOpen) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [topicsOpen]);

  useEffect(() => {
    setScrollLocked(isBodyScrollLocked());
    return subscribeBodyScrollLock(setScrollLocked);
  }, []);

  const hideForOverlay = scrollLocked && !topicsOpen;

  const isActive = (id: string, href: string | null) => {
    if (id === "topics") return topicsOpen || pathname.startsWith("/category/");
    if (href === "/") return pathname === "/";
    if (href) return pathname.startsWith(href);
    return false;
  };

  return (
    <>
      {topicsOpen && (
        <div
          id="mobile-topics-sheet"
          className={`md:hidden fixed inset-0 ${Z_INDEX.mobileNavOverlay} transition-opacity duration-200 ${
            topicsOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-ink/40" onClick={closeTopics} />
          <div
            className={`absolute left-2 right-2 max-[380px]:left-1.5 max-[380px]:right-1.5 bg-paper/95 backdrop-blur-2xl border border-rule shadow-2xl rounded-t-2xl transition-transform duration-300 ${
              topicsOpen ? "translate-y-0" : "translate-y-full"
            }`}
            style={{
              bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div className="p-4 pb-5 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="font-body text-[11px] font-bold tracking-wider uppercase text-ink-soft">
                  {t("nav.browse_topics")}
                </p>
                <button
                  type="button"
                  onClick={closeTopics}
                  className="p-1 text-muted hover:text-ink min-touch flex items-center justify-center rounded"
                  aria-label="Close topics"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const active = pathname === `/category/${cat.slug}/`;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}/`}
                      prefetch={true}
                      onClick={closeTopics}
                      className={`flex items-center justify-center px-3 py-3 text-center text-xs sm:text-sm transition-all rounded-lg min-h-[44px] ${
                        active
                          ? "bg-ink text-paper font-bold shadow-sm"
                          : "text-ink bg-paper-2/60 border border-rule/60 hover:border-ink/30 hover:bg-paper-2"
                      }`}
                    >
                      {t(`nav.${cat.slug}`)}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav
        className={`mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 ${Z_INDEX.mobileNav} transition-transform duration-300 ease-out transform-gpu ${
          hideForOverlay ? "translate-y-full" : "translate-y-0"
        }`}
        aria-hidden={hideForOverlay ? "true" : "false"}
        aria-label="Mobile navigation"
        style={{ pointerEvents: hideForOverlay ? "none" : "auto" }}
      >
        <div
          className="relative border-t border-rule/60 glass shadow-[0_-4px_24px_rgb(var(--c-ink)/0.04)] select-none touch-manipulation transition-all duration-300"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex items-center justify-around px-1 pt-1 pb-1.5 sm:pt-1.5 sm:pb-2">
            {TABS.map((tab) => {
              const active = isActive(tab.id, tab.href);
              const Icon = tab.icon;
              const isTopics = tab.id === "topics";

              const inner = (
                <div className="relative flex flex-col items-center justify-center gap-1 px-2.5 py-1.5 min-w-[50px] min-h-[48px] active:scale-90 transition-all duration-150">
                  {active && (
                    <span className="absolute top-0 w-8 h-[2.5px] rounded-full bg-ink shadow-2xs animate-fade-in" />
                  )}
                  <div className={`transition-transform duration-200 ${active ? "scale-110 text-ink" : "text-muted"}`}>
                    <Icon />
                  </div>
                  <span
                    className={`text-[11px] leading-none tracking-tight transition-colors duration-150 ${
                      active ? "text-ink font-bold" : "text-muted font-medium"
                    }`}
                  >
                    {t(tab.key)}
                  </span>
                </div>
              );

              if (isTopics) {
                return (
                  <button
                    key={tab.id}
                    onClick={toggleTopics}
                    className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/50"
                    aria-label="Browse topics"
                    aria-expanded={topicsOpen}
                    aria-controls="mobile-topics-sheet"
                  >
                    {inner}
                  </button>
                );
              }
              if (tab.id === "search") {
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      closeTopics();
                      window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
                    }}
                    aria-label="Open search"
                    className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/50"
                  >
                    {inner}
                  </button>
                );
              }
              return (
                <Link
                  key={tab.id}
                  href={tab.href!}
                  prefetch={true}
                  onClick={closeTopics}
                  aria-label={t(tab.key)}
                  className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/50"
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
