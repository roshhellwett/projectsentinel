/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Editorial paper + ink palette (driven by CSS vars so dark mode
        //    flips with a single class on <html>). Hex fallbacks live in
        //    globals.css :root and .dark blocks.
        paper:        'rgb(var(--c-paper) / <alpha-value>)',
        'paper-2':    'rgb(var(--c-paper-2) / <alpha-value>)',
        'paper-tint': 'rgb(var(--c-paper-tint) / <alpha-value>)',
        ink:          'rgb(var(--c-ink) / <alpha-value>)',
        'ink-soft':   'rgb(var(--c-ink-soft) / <alpha-value>)',
        muted:        'rgb(var(--c-muted) / <alpha-value>)',
        subtle:       'rgb(var(--c-subtle) / <alpha-value>)',
        rule:         'rgb(var(--c-rule) / <alpha-value>)',
        'rule-strong':'rgb(var(--c-rule-strong) / <alpha-value>)',

        // Editorial crimson — the single accent. Used sparingly on category
        // labels, links, active state, and the breaking-news bar.
        accent:       'rgb(var(--c-accent) / <alpha-value>)',
        'accent-hover':'rgb(var(--c-accent-hover) / <alpha-value>)',
        'accent-soft': 'rgb(var(--c-accent-soft) / <alpha-value>)',

        // Back-compat aliases so we don't have to touch every component yet.
        background:    'rgb(var(--c-paper) / <alpha-value>)',
        'background-2':'rgb(var(--c-paper-2) / <alpha-value>)',
        foreground:    'rgb(var(--c-ink) / <alpha-value>)',
        surface:       'rgb(var(--c-paper) / <alpha-value>)',
        'surface-hover':'rgb(var(--c-paper-2) / <alpha-value>)',

        // Credibility tiers — re-tuned to editorial hues.
        'cred-high': 'rgb(var(--c-cred-high) / <alpha-value>)',
        'cred-mid':  'rgb(var(--c-cred-mid) / <alpha-value>)',
        'cred-low':  'rgb(var(--c-cred-low) / <alpha-value>)',

        // India tricolor — retained for decorative civic accents only.
        'india-saffron': '#ff9933',
        'india-green':   '#138808',

        // Portfolio accent tokens (derived from the Zenith palette)
        'accent-neutral':   '#1e1e1a',
        'accent-neutral-hover': '#373732',
      },
      fontFamily: {
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        serif:   ['var(--font-display)', 'Georgia', 'serif'],
        mono:    ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        // Quiet editorial shadows — paper-on-paper, never glowy.
        'rule':         '0 0 0 1px rgb(var(--c-rule) / 1)',
        'paper':        '0 1px 0 rgb(var(--c-rule) / 1)',
        'paper-lift':   '0 1px 0 rgb(var(--c-rule) / 1), 0 2px 8px -2px rgb(var(--c-shadow) / 0.06), 0 12px 32px -10px rgb(var(--c-shadow) / 0.20)',
        'glow-accent':  '0 0 0 1px rgb(var(--c-accent) / 0.28)',
      },
      letterSpacing: {
        'editorial': '-0.011em',
        'kicker':    '0.18em',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        shimmer:   'shimmer 1.6s linear infinite',
        'ticker':  'ticker 38s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
