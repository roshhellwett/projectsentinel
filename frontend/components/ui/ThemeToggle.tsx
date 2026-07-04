'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { safeRead, safeWrite } from '@/lib/utils/safeStorage';

const STORAGE_KEY = 'iv-theme';

type Theme = 'light' | 'dark';

function readSystem(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStored(): Theme | null {
  const v = safeRead(STORAGE_KEY);
  return v === 'dark' || v === 'light' ? v : null;
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  const tags = document.querySelectorAll('meta[name="theme-color"]');
  tags.forEach((t) => {
    t.setAttribute('content', theme === 'dark' ? '#1e1c18' : '#e1d7c2');
    t.removeAttribute('media');
  });
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const next = readStored() ?? readSystem();
    setTheme(next);
    applyTheme(next);
    setMounted(true);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      if (readStored()) return;
      const sys: Theme = e.matches ? 'dark' : 'light';
      setTheme(sys);
      applyTheme(sys);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const updated = readStored() ?? readSystem();
        setTheme(updated);
        applyTheme(updated);
      }
    };
    window.addEventListener('storage', onStorage);

    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
      return () => {
        window.removeEventListener('storage', onStorage);
        mq.removeEventListener('change', onChange);
      };
    } else if (mq.addListener) {
      mq.addListener(onChange);
      return () => {
        window.removeEventListener('storage', onStorage);
        mq.removeListener(onChange);
      };
    }
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      safeWrite(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const Icon = mounted ? (theme === 'dark' ? Sun : Moon) : Moon;
  const label = mounted
    ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
    : 'Toggle theme';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`tap-target text-muted hover:text-ink hover-lift rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.div
            key={theme}
            initial={{ opacity: 0, rotate: reducedMotion ? 0 : -90, scale: reducedMotion ? 1 : 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: reducedMotion ? 0 : 90, scale: reducedMotion ? 1 : 0.5 }}
            transition={reducedMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 450, damping: 25, mass: 0.6 }}
            className="will-change-transform will-change-opacity transform-gpu flex items-center justify-center"
          >
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </motion.div>
        )}
        {!mounted && (
          <div className="flex items-center justify-center opacity-0">
            <Moon className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </div>
        )}
      </AnimatePresence>
    </button>
  );
}
