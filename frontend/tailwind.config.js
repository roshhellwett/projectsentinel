/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper:        'rgb(var(--c-paper) / <alpha-value>)',
        'paper-2':    'rgb(var(--c-paper-2) / <alpha-value>)',
        'paper-tint': 'rgb(var(--c-paper-tint) / <alpha-value>)',
        ink:          'rgb(var(--c-ink) / <alpha-value>)',
        'ink-soft':   'rgb(var(--c-ink-soft) / <alpha-value>)',
        muted:        'rgb(var(--c-muted) / <alpha-value>)',
        subtle:       'rgb(var(--c-subtle) / <alpha-value>)',
        rule:         'rgb(var(--c-rule) / <alpha-value>)',
        'rule-strong':'rgb(var(--c-rule-strong) / <alpha-value>)',
        accent:       'rgb(var(--c-accent) / <alpha-value>)',
        'accent-hover':'rgb(var(--c-accent-hover) / <alpha-value>)',
        'accent-soft': 'rgb(var(--c-accent-soft) / <alpha-value>)',
        background:    'rgb(var(--c-paper) / <alpha-value>)',
        foreground:    'rgb(var(--c-ink) / <alpha-value>)',
        stamp:       'rgb(var(--c-stamp) / <alpha-value>)',
        gold:        'rgb(var(--c-gold) / <alpha-value>)',
        'cred-high': 'rgb(var(--c-cred-high) / <alpha-value>)',
        'cred-mid':  'rgb(var(--c-cred-mid) / <alpha-value>)',
        'cred-low':  'rgb(var(--c-cred-low) / <alpha-value>)',
      },
      fontFamily: {
        sans:    ['var(--font-sans)', 'Georgia', 'serif'],
        display: ['var(--font-display)', 'cursive'],
        body:    ['var(--font-body)', 'Georgia', 'serif'],
        serif:   ['var(--font-body)', 'Georgia', 'serif'],
        hand:    ['var(--font-hand)', 'cursive'],
        mono:    ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'shimmer': 'shimmer 1.8s linear infinite',
        'entrance': 'entranceFade 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        entranceFade: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
