"use client";

import Link from "next/link";
import { ArrowUpRight, Code2, Rss } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-shared";
import { InstallAppButton } from "@/components/ui/InstallAppButton";
import { Brand } from "./Brand";

const GROUPS = [
  { title: "footer.news", links: [
    { href: "/category/politics", key: "nav.politics" },
    { href: "/category/business", key: "nav.business" },
    { href: "/category/world", key: "nav.world" },
    { href: "/category/sports", key: "nav.sports" },
    { href: "/category/tech", key: "nav.tech" },
    { href: "/category/entertainment", key: "nav.entertainment" },
  ] },
  { title: "footer.about", links: [
    { href: "/how-it-works", key: "nav.how_it_works" },
    { href: "/saved", key: "nav.saved" },
    { href: "/swipe", key: "nav.swipe" },
    { href: "/chat", key: "nav.assistant" },
  ] },
  { title: "footer.legal", links: [
    { href: "/privacy", key: "footer.privacy" },
    { href: "/terms", key: "footer.terms" },
    { href: "/corrections", key: "footer.corrections" },
    { href: "/contact", key: "footer.contact" },
  ] },
] as const;

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site-footer mt-auto">
      <div className="site-container">
        <div className="site-footer__statement">
          <div><p className="editorial-kicker mb-3">A considered perspective</p><h2>Stay curious.<br />Stay <em>well-informed.</em></h2></div>
          <Link href="/how-it-works" className="editorial-link">Built on transparency <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr] gap-x-8 gap-y-9 py-10">
          <div className="col-span-2 lg:col-span-1">
            <Brand />
            <p className="text-[12px] text-ink-soft max-w-[34ch] mt-5 mb-5">{t("footer.description")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <a href="/rss.xml" className="icon-button bg-paper" aria-label={t("footer.rss_feed")}><Rss size={15} aria-hidden="true" /></a>
              <a href="https://github.com/roshhellwett/projectsentinel" target="_blank" rel="noopener noreferrer" className="icon-button bg-paper" aria-label="Source code on GitHub"><Code2 size={16} aria-hidden="true" /></a>
              <InstallAppButton />
            </div>
          </div>
          {GROUPS.map(group => <div key={group.title}><h3 className="font-mono font-normal text-[10px] tracking-wider text-muted uppercase mb-3">{t(group.title)}</h3><ul>{group.links.map(link => <li key={link.href}><Link href={link.href} className="inline-flex items-center min-h-[44px] text-[12px] text-ink-soft hover:text-accent transition-colors">{t(link.key)}</Link></li>)}</ul></div>)}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 py-5 border-t border-rule text-[10px] text-muted">
          <p>© {new Date().getFullYear()} India Verified. Open-source, MIT licence.</p>
          <p>{t("footer.built_in_india")} · Created by <a href="https://github.com/roshhellwett" target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-rule-strong">Roshhellwett</a></p>
        </div>
      </div>
    </footer>
  );
}
