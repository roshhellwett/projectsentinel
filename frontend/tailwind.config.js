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
        background: '#fbfbfd',
        'background-2': '#f2f4f8',
        foreground: '#111827',
        surface: 'rgba(255, 255, 255, 0.78)',
        'surface-hover': 'rgba(255, 255, 255, 0.94)',

        // Text
        muted: '#4b5563',
        subtle: '#7a8494',

        // Accent — Electric Blue
        accent: '#0a84ff',
        'accent-hover': '#5ac8fa',
        'accent-soft': 'rgba(10, 132, 255, 0.14)',

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
        display: ['var(--font-newsreader)', 'Newsreader', 'Georgia', 'serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
      },
      boxShadow: {
        'glow-accent': '0 0 0 1px rgba(10, 132, 255, 0.2), 0 18px 54px -18px rgba(10, 132, 255, 0.52)',
        'glow-accent-lg': '0 0 0 1px rgba(90, 200, 250, 0.28), 0 30px 76px -18px rgba(10, 132, 255, 0.6)',
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
