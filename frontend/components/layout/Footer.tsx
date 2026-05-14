import Link from 'next/link';
import { Github } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/category/politics/', label: 'Politics' },
  { href: '/category/business/', label: 'Business' },
  { href: '/category/sports/', label: 'Sports' },
  { href: '/category/tech/', label: 'Tech' },
  { href: '/saved/', label: 'Saved stories' },
  { href: '/how-it-works/', label: 'How It Works' },
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
    <footer className="relative mt-auto bg-white/74 border-t border-slate-950/[0.08] backdrop-blur-2xl">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="container mx-auto px-4 lg:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 mb-12">
          {/* Column 1 — Brand */}
          <div>
            <Link href="/" className="touch-polish inline-flex items-center gap-2.5 group mb-4 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all duration-300"
                style={{
                  background: 'linear-gradient(145deg, #111111, #0a0a0a)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 24px -8px rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span className="text-[12px] font-light text-white/90 tracking-[0.15em] leading-none" style={{ letterSpacing: '0.15em' }}>IV</span>
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-slate-950">India Verified</span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-sm">
              Premium verified news for a quieter, clearer India.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-polish inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white border border-slate-950/[0.10] hover:border-slate-950/[0.18] text-[13px] font-medium text-slate-700 hover:text-slate-950 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_12px_30px_-24px_rgba(10,132,255,0.55)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>

          {/* Column 2 — Navigate */}
          <div>
            <h3 className="text-[11px] font-semibold text-slate-950 uppercase tracking-[0.18em] mb-5">
              Navigate
            </h3>
            <ul className="space-y-3 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="touch-polish rounded-md text-slate-600 hover:text-slate-950 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Transparency */}
          <div>
            <h3 className="text-[11px] font-semibold text-slate-950 uppercase tracking-[0.18em] mb-5">
              Transparency
            </h3>
            <ul className="space-y-3 text-sm">
              {TRANSPARENCY.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-slate-600">
                  <span className="mt-2 w-1 h-1 rounded-full bg-accent flex-shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-slate-950/[0.08] mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Zenith Open Source Projects. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Built with Next.js, Tailwind CSS &amp; Framer Motion · Designed by Roshhellwett · Powered by Claude &amp; Gemini
          </p>
        </div>
      </div>
    </footer>
  );
}
