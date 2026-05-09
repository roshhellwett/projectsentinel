import Link from 'next/link';
import { Github } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/category/politics', label: 'Politics' },
  { href: '/category/business', label: 'Business' },
  { href: '/category/sports', label: 'Sports' },
  { href: '/category/tech', label: 'Tech' },
  { href: '/how-it-works', label: 'How It Works' },
];

const TRANSPARENCY = [
  'No ads, no sponsored content',
  'All source links visible',
  'Open source codebase',
  'AI verification pipeline',
];

const REPO_URL = 'https://github.com/roshhellwett/projectsentinel';

export function Footer() {
  return (
    <footer className="relative mt-auto bg-[#080808] border-t border-white/[0.06]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="container mx-auto px-4 lg:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 mb-12">
          {/* Column 1 — Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center group-hover:border-accent/50 transition-colors">
                <span className="text-[13px] font-black text-white tracking-tight leading-none">IV</span>
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-white">India Verified</span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed mb-5 max-w-sm">
              AI-powered. Cross-referenced. Trusted.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-transparent hover:bg-white/[0.06] border border-white/[0.14] hover:border-white/[0.25] text-[13px] font-medium text-white transition-all"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>

          {/* Column 2 — Navigate */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-[0.18em] mb-5">
              Navigate
            </h3>
            <ul className="space-y-3 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Transparency */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-[0.18em] mb-5">
              Transparency
            </h3>
            <ul className="space-y-3 text-sm">
              {TRANSPARENCY.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-zinc-400">
                  <span className="mt-2 w-1 h-1 rounded-full bg-accent flex-shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-white/[0.08] mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-zinc-500">
            &copy; 2026 Zenith Open Source Projects. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-2xl">
            Built with Next.js, Tailwind CSS &amp; Framer Motion · Designed by Roshhellwett · Powered by Claude &amp; Gemini
          </p>
        </div>
      </div>
    </footer>
  );
}
