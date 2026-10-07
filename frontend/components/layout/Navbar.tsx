"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Bookmark, Menu, Search, ShieldCheck, X } from "lucide-react";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/utils/bodyScrollLock";
import { OPEN_SEARCH_EVENT } from "@/components/ui/KeyboardShortcuts";
import { useI18n } from "@/lib/i18n/i18n-shared";
import { LanguageFilter } from "./LanguageFilter";
import { ConnectionStatus } from "./ConnectionStatus";
import { Brand } from "./Brand";
import { CategoryIcon, MaterialIcon } from "@/components/visual/MaterialIcon";

const SearchBar = dynamic(() => import("@/components/ui/SearchBar").then(module => module.SearchBar), { ssr: false });

const NAV_LINKS = [
  { href: "/category/politics", key: "nav.politics" },
  { href: "/category/business", key: "nav.business" },
  { href: "/category/world", key: "nav.world" },
  { href: "/category/tech", key: "nav.tech" },
  { href: "/category/sports", key: "nav.sports" },
  { href: "/saved", key: "nav.saved" },
  { href: "/how-it-works", key: "nav.how_it_works" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    const open = () => { setMenuOpen(false); setSearchOpen(true); };
    window.addEventListener(OPEN_SEARCH_EVENT, open);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, open);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    lockBodyScroll();
    const timer = window.setTimeout(() => panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); return; }
      if (event.key !== "Tab") return;
      const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a[href], button, select") ?? []).filter(item => item.offsetParent !== null);
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const breakpoint = window.matchMedia("(min-width: 1200px)");
    const closeOnDesktop = () => { if (breakpoint.matches) setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    breakpoint.addEventListener("change", closeOnDesktop);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      breakpoint.removeEventListener("change", closeOnDesktop);
      unlockBodyScroll();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [menuOpen]);

  const active = (href: string) => pathname.replace(/\/$/, "") === href;
  return (
    <>
      <header className="site-header" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="site-container site-header__inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            {NAV_LINKS.map(link => <Link href={link.href} key={link.href} aria-current={active(link.href) ? "page" : undefined}>{link.key === "nav.saved" && <Bookmark size={12} aria-hidden="true" />}{t(link.key)}</Link>)}
          </nav>
          <div className="header-actions">
            <div className="hidden sm:block"><LanguageFilter /></div>
            <button type="button" onClick={() => setSearchOpen(true)} className="icon-button" aria-label="Search articles (press /)"><Search size={17} strokeWidth={1.5} aria-hidden="true" /></button>
            <button ref={triggerRef} type="button" onClick={() => setMenuOpen(true)} className="icon-button min-[1200px]:hidden" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="mobile-nav-drawer"><Menu size={19} strokeWidth={1.5} aria-hidden="true" /></button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div key="menu-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }} className="glass-overlay fixed inset-0 z-[100]" onClick={() => setMenuOpen(false)} aria-hidden="true" />
            <motion.aside key="menu-panel" ref={panelRef} id="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Site navigation" initial={{ x: reduceMotion ? 0 : "100%" }} animate={{ x: 0 }} exit={{ x: reduceMotion ? 0 : "100%" }} transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 38, mass: 0.9 }} className="glass-menu fixed inset-y-0 right-0 z-[110] w-full max-w-[420px] flex flex-col" style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
              <div className="flex items-center justify-between p-5 border-b border-rule"><Brand /><button type="button" className="icon-button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={18} aria-hidden="true" /></button></div>
              <nav className="p-6 flex-1 overflow-y-auto" aria-label="Sections">
                <p className="editorial-kicker mb-5">Your daily perspective</p>
                {NAV_LINKS.map(link => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} aria-current={active(link.href) ? "page" : undefined} className="flex items-center justify-between py-4 border-b border-rule group"><span className="flex items-center gap-4">{link.key === "nav.saved" ? <MaterialIcon icon={Bookmark} tone="coral" /> : link.key === "nav.how_it_works" ? <MaterialIcon icon={ShieldCheck} tone="sage" /> : <CategoryIcon category={link.href.split("/").pop() ?? ""} size="md" />}<span className="font-display text-[25px] tracking-tight group-hover:text-accent">{t(link.key)}</span></span><ArrowUpRight size={17} className="text-accent" aria-hidden="true" /></Link>)}
                <Link href="/chat" onClick={() => setMenuOpen(false)} className="editorial-link mt-5">Ask the news assistant <ArrowUpRight size={15} aria-hidden="true" /></Link>
              </nav>
              <div className="flex items-center justify-between border-t border-rule p-5"><LanguageFilter /><ConnectionStatus /><a href="https://github.com/roshhellwett/projectsentinel" target="_blank" rel="noopener noreferrer" className="editorial-link text-muted">Open-source <ArrowUpRight size={13} aria-hidden="true" /></a></div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <SearchBar isOpen={searchOpen} onClose={closeSearch} />
    </>
  );
}
