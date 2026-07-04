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
        // ── Core paper + ink palette (driven by CSS vars) ──────────
        paper:        'rgb(var(--c-paper) / <alpha-value>)',
        'paper-2':    'rgb(var(--c-paper-2) / <alpha-value>)',
        'paper-tint': 'rgb(var(--c-paper-tint) / <alpha-value>)',
        ink:          'rgb(var(--c-ink) / <alpha-value>)',
        'ink-soft':   'rgb(var(--c-ink-soft) / <alpha-value>)',
        muted:        'rgb(var(--c-muted) / <alpha-value>)',
        subtle:       'rgb(var(--c-subtle) / <alpha-value>)',
        rule:         'rgb(var(--c-rule) / <alpha-value>)',
        'rule-strong':'rgb(var(--c-rule-strong) / <alpha-value>)',

        // ── Vibrant accent system ──────────────────────────────────
        accent:       'rgb(var(--c-accent) / <alpha-value>)',
        'accent-hover':'rgb(var(--c-accent-hover) / <alpha-value>)',
        'accent-soft': 'rgb(var(--c-accent-soft) / <alpha-value>)',

        // ── Dopamine engagement colors ─────────────────────────────
        'glow-from':  'rgb(var(--c-glow-from) / <alpha-value>)',
        'glow-to':    'rgb(var(--c-glow-to) / <alpha-value>)',
        'like':       'rgb(var(--c-like) / <alpha-value>)',
        'streak':     'rgb(var(--c-streak) / <alpha-value>)',
        'xp':         'rgb(var(--c-xp) / <alpha-value>)',

        // Back-compat aliases
        background:    'rgb(var(--c-paper) / <alpha-value>)',
        'background-2':'rgb(var(--c-paper-2) / <alpha-value>)',
        foreground:    'rgb(var(--c-ink) / <alpha-value>)',
        surface:       'rgb(var(--c-paper) / <alpha-value>)',
        'surface-hover':'rgb(var(--c-paper-2) / <alpha-value>)',

        // Credibility tiers
        'cred-high': 'rgb(var(--c-cred-high) / <alpha-value>)',
        'cred-mid':  'rgb(var(--c-cred-mid) / <alpha-value>)',
        'cred-low':  'rgb(var(--c-cred-low) / <alpha-value>)',

        // India tricolor — retained for decorative civic accents
        'india-saffron': '#ff9933',
        'india-green':   '#138808',

        // Portfolio accent tokens
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
        'rule':         '0 0 0 1px rgb(var(--c-rule) / 1)',
        'paper':        '0 1px 0 rgb(var(--c-rule) / 1)',
        'paper-lift':   '0 1px 0 rgb(var(--c-rule) / 1), 0 4px 12px -2px rgb(var(--c-shadow) / 0.08), 0 16px 40px -10px rgb(var(--c-shadow) / 0.18)',
        'glow-accent':  '0 0 0 1px rgb(var(--c-accent) / 0.28), 0 0 16px rgb(var(--c-accent) / 0.08)',
        'card':         '0 2px 8px -4px rgb(var(--c-shadow) / 0.06), 0 8px 24px -12px rgb(var(--c-shadow) / 0.08)',
        'card-lg':      '0 4px 16px -8px rgb(var(--c-shadow) / 0.08), 0 16px 48px -16px rgb(var(--c-shadow) / 0.12)',
        'card-glow':    '0 4px 16px -4px rgb(var(--c-accent) / 0.12), 0 16px 48px -12px rgb(var(--c-accent) / 0.08)',
        'hero':         '0 8px 32px -8px rgb(var(--c-shadow) / 0.12), 0 24px 64px -16px rgb(var(--c-shadow) / 0.10)',
        'glass':        '0 4px 24px -4px rgb(var(--c-shadow) / 0.06), 0 0 0 1px rgb(var(--c-rule) / 0.5)',
        'glow-like':    '0 0 20px rgb(var(--c-like) / 0.3)',
        'glow-streak':  '0 0 20px rgb(var(--c-streak) / 0.3)',
      },
      letterSpacing: {
        'editorial': '-0.015em',
        'kicker':    '0.18em',
      },
      borderRadius: {
        'card': '16px',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease-out',
        'shimmer':       'shimmer 1.8s linear infinite',
        'ticker':        'ticker 38s linear infinite',
        'streak-glow':   'streakGlow 2s ease-in-out infinite',
        'breathe':       'breathe 3s ease-in-out infinite',
        'glow-pulse':    'glowPulse 3s ease-in-out infinite',
        'gradient-shift':'gradientShift 8s ease infinite',
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
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.92' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};
