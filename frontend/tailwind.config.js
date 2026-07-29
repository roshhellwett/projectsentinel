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
      fontSize: {
        'fluid-2xs':  'var(--fs-2xs)',
        'fluid-xs':   'var(--fs-xs)',
        'fluid-sm':   'var(--fs-sm)',
        'fluid-base': 'var(--fs-base)',
        'fluid-md':   'var(--fs-md)',
        'fluid-lg':   'var(--fs-lg)',
        'fluid-xl':   'var(--fs-xl)',
        'fluid-2xl':  'var(--fs-2xl)',
        'fluid-3xl':  'var(--fs-3xl)',
        'fluid-4xl':  'var(--fs-4xl)',
      },
      spacing: {
        'fluid-3xs': 'var(--sp-3xs)',
        'fluid-2xs': 'var(--sp-2xs)',
        'fluid-xs':  'var(--sp-xs)',
        'fluid-sm':  'var(--sp-sm)',
        'fluid-md':  'var(--sp-md)',
        'fluid-lg':  'var(--sp-lg)',
        'fluid-xl':  'var(--sp-xl)',
        'fluid-2xl': 'var(--sp-2xl)',
        'fluid-3xl': 'var(--sp-3xl)',
      },
      maxWidth: {
        'prose-fluid': 'var(--measure-prose)',
        'narrow-fluid': 'var(--measure-narrow)',
      },
      borderRadius: {
        'token-xs': 'var(--radius-xs)',
        'token-sm': 'var(--radius-sm)',
        'token-md': 'var(--radius-md)',
        'token-lg': 'var(--radius-lg)',
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-33.3333%)' }, // Scrolls exactly 1/3 since we have 3 duplicated segments
        }
      },
      animation: {
        ticker: 'ticker 40s linear infinite',
      },

    },
  },
  plugins: [],
};
