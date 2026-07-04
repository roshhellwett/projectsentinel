'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { useEffect, useRef, useState } from 'react';

interface ReadingProgressProps {

  targetSelector?: string;
}

export function ReadingProgress({ targetSelector }: ReadingProgressProps = {}) {
  const [progress, setProgress] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const compute = () => {
      const target = targetSelector
        ? document.querySelector(targetSelector) as HTMLElement | null
        : null;

      const scrolled = window.scrollY;
      let total: number;

      if (target) {
        const rect = target.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        const elementHeight = rect.height;
        const viewport = window.innerHeight;
        total = Math.max(1, elementHeight + elementTop - viewport);
      } else {
        total = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight,
        );
      }

      const ratio = Math.max(0, Math.min(1, scrolled / total));
      setProgress(ratio);
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(() => {
        compute();
        tickingRef.current = false;
      });
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [targetSelector]);

  const visible = progress > 0.005 && progress < 0.995;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-x-0 ${Z_INDEX.readingProgress} h-[2px] pointer-events-none`}
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 4rem)' }}
    >
      <div
        className="h-full origin-left transition-opacity duration-300"
        style={{
          transform: `scaleX(${progress})`,
          opacity: visible ? 1 : 0,
          background: 'linear-gradient(to right, rgb(var(--c-accent-hover)), rgb(var(--c-accent)), rgb(var(--c-accent-hover)))',
          boxShadow: '0 0 12px rgb(var(--c-accent) / 0.55)',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
