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
        // Page surfaces
        background: '#0a0a0a',
        'background-2': '#080808',
        surface: 'rgba(255, 255, 255, 0.04)',
        'surface-hover': 'rgba(255, 255, 255, 0.06)',

        // Text
        muted: '#a1a1aa',
        subtle: '#71717a',

        // Accent — Electric Blue
        accent: '#2563eb',
        'accent-hover': '#3b82f6',
        'accent-soft': 'rgba(37, 99, 235, 0.12)',

        // Credibility
        'cred-high': '#22c55e',
        'cred-mid': '#f59e0b',
        'cred-low': '#ef4444',

        // India tricolor — kept for subtle decorative accents only
        'india-saffron': '#ff9933',
        'india-green': '#138808',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
      },
      boxShadow: {
        'glow-accent': '0 0 0 1px rgba(37, 99, 235, 0.18), 0 12px 40px -12px rgba(37, 99, 235, 0.35)',
        'glow-accent-lg': '0 0 0 1px rgba(37, 99, 235, 0.25), 0 24px 60px -10px rgba(37, 99, 235, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
