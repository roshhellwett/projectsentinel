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
        // Page surfaces — soft white
        background: '#ffffff',
        'background-2': '#f7f7fb',
        foreground: '#1e1b4b',
        surface: 'rgba(255, 255, 255, 0.55)',
        'surface-hover': 'rgba(255, 255, 255, 0.72)',

        // Text
        muted: '#4a5568',
        subtle: '#94a3b8',

        // Accent — soft lavender
        accent: '#8b7ff0',
        'accent-hover': '#a08cdc',
        'accent-soft': 'rgba(160, 140, 220, 0.18)',

        // Credibility — pastel-coded per redesign spec
        // 90-100 mint, 70-89 lavender, <70 peach.
        'cred-high': '#10b981',
        'cred-mid':  '#8b7ff0',
        'cred-low':  '#f59e0b',

        // India tricolor — kept for subtle decorative accents only
        'india-saffron': '#ff9933',
        'india-green': '#138808',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-newsreader)', 'Newsreader', 'Georgia', 'serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
      },
      boxShadow: {
        'glow-accent': '0 0 0 1px rgba(139, 127, 240, 0.2), 0 18px 54px -18px rgba(139, 127, 240, 0.52)',
        'glow-accent-lg': '0 0 0 1px rgba(160, 140, 220, 0.28), 0 30px 76px -18px rgba(139, 127, 240, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-fade-in': 'scaleFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleFadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
    },
  },
  plugins: [],
};
