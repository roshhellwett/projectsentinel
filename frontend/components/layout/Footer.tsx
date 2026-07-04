

import Link from 'next/link';
import { Github, Rss, ExternalLink } from 'lucide-react';
import { InstallAppButton } from './InstallAppButton';

const NEWS_LINKS = [
  { href: '/category/politics/',     label: 'Politics' },
  { href: '/category/business/',     label: 'Business' },
  { href: '/category/sports/',       label: 'Sports' },
  { href: '/category/tech/',         label: 'Technology' },
  { href: '/category/world/',        label: 'World' },
  { href: '/category/entertainment/', label: 'Entertainment' },
];

const ABOUT_LINKS = [
  { href: '/how-it-works/', label: 'How verification works' },
  { href: '/saved/',        label: 'Saved stories' },
];

const LEGAL_LINKS = [
  { href: '/privacy/',     label: 'Privacy Policy' },
  { href: '/terms/',       label: 'Terms of Use' },
  { href: '/corrections/', label: 'Corrections Policy' },
  { href: '/contact/',     label: 'Contact & Tips' },
];

const TRANSPARENCY = [
  'No advertising or sponsored content',
  'Every claim links back to its sources',
  'Open-source under the MIT licence',
  'AI cross-verifies before publishing',
];

const REPO_URL = 'https://github.com/roshhellwett/projectsentinel';
const RSS_URL = '/rss.xml';

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="editorial-kicker mb-5 text-[11px]">
      <span>{children}</span>
    </h3>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-auto bg-paper-2/80 backdrop-blur-sm border-t border-rule/40">

      {/* Premium gradient divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-accent/20 to-transparent blur-sm" aria-hidden="true" />

      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 pt-12 pb-10">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-10 mb-10 border-b border-rule">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all hover-lift"
            >
              <span
                aria-hidden="true"
                className="flex items-center justify-center w-10 h-10 bg-ink text-paper font-display font-bold text-base tracking-[0.06em] rounded-lg"
              >
                IV
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-2xl font-bold text-ink tracking-[-0.025em]">
                  India Verified
                </span>
                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-accent">
                  AI-verified Indian news
                </span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-md">
              An independent newsroom of one. Every story is cross-referenced
              across multiple trusted Indian publications, scored, and rewritten
              without ads, bias, or noise.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <InstallAppButton />
            <a
              href={RSS_URL}
              className="tap-target min-h-[44px] inline-flex items-center gap-1.5 px-3 pt-[7px] pb-[9px] border border-rule-strong text-[13px] font-medium text-ink hover:bg-paper transition-all hover-lift rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Rss className="w-3.5 h-3.5" />
              RSS Feed
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target min-h-[44px] inline-flex items-center gap-1.5 px-3 pt-[7px] pb-[9px] border border-rule-strong text-[13px] font-medium text-ink hover:bg-paper transition-all hover-lift rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Github className="w-3.5 h-3.5" />
              View source
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-10 mb-12">
          <div>
            <ColumnHeading>News</ColumnHeading>
            <ul className="space-y-3 sm:space-y-2.5 text-sm">
              {NEWS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-accent transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent footer-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>About</ColumnHeading>
            <ul className="space-y-3 sm:space-y-2.5 text-sm">
              {ABOUT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-accent transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>Legal</ColumnHeading>
            <ul className="space-y-3 sm:space-y-2.5 text-sm">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-accent transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>Transparency</ColumnHeading>
            <ul className="space-y-3 sm:space-y-2.5 text-sm">
              {TRANSPARENCY.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-muted">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" aria-hidden="true" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse md:items-center md:justify-between gap-6 sm:gap-3 pt-8 md:pt-6 border-t border-rule">
          <p className="text-xs text-subtle leading-relaxed">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-paper-tint border border-rule">
              <span aria-hidden="true" className="inline-block w-4 h-3 rounded-[2px] overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(180deg, #ff9933 33%, #fff 33% 66%, #138808 66%)' }} />
              <span className="font-semibold text-muted">Built in India</span>
            </span>
            <span aria-hidden="true" className="mx-2 text-rule-strong">·</span>
            Designed &amp; engineered by{' '}
            <a
              href="https://github.com/roshhellwett"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline decoration-rule-strong underline-offset-2 hover:decoration-accent transition-colors"
            >
              Roshhellwett
            </a>
            , with the help of{' '}
            <a
              href="https://www.anthropic.com/claude"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted underline decoration-rule-strong underline-offset-2 hover:text-ink hover:decoration-accent transition-colors"
            >
              Claude
            </a>{' '}
            &amp; other tools.
          </p>
          <p className="text-xs text-subtle leading-relaxed" suppressHydrationWarning>
            &copy; {year} Zenith Open Source Projects. Reporting cross-verified by AI;
            stories may be republished under the MIT licence with attribution.
          </p>
        </div>
      </div>
    </footer>
  );
}
