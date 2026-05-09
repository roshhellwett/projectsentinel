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
        background: '#fafaf9', // warm stone-50
        surface: '#ffffff',
        'surface-hover': '#f5f5f4', // stone-100
        accent: '#1e3a8a', // deep navy (Ashoka Chakra)
        'accent-hover': '#1e40af',
        'india-saffron': '#ff9933',
        'india-green': '#138808',
        'india-blue': '#000080',
        'saffron-light': '#fff4e6',
        'saffron-dark': '#e8740a',
        success: '#138808',
        warning: '#ff9933',
        danger: '#ef4444',
        muted: '#78716c' // stone-500
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-bottom': 'slideInBottom 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-accent': 'pulseAccent 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'blob': 'blob 7s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'score-fill': 'scoreFill 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInBottom: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseAccent: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 153, 51, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(255, 153, 51, 0.15)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 153, 51, 0.2), 0 0 20px rgba(255, 153, 51, 0.1)' },
          '100%': { boxShadow: '0 0 10px rgba(255, 153, 51, 0.3), 0 0 40px rgba(255, 153, 51, 0.15)' },
        },
        scoreFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--score-width)' },
        }
      },
      boxShadow: {
        'saffron': '0 4px 14px -3px rgba(255, 153, 51, 0.25)',
        'saffron-lg': '0 10px 30px -5px rgba(255, 153, 51, 0.3)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(255, 153, 51, 0.08)',
      }
    }
  },
  plugins: []
}
