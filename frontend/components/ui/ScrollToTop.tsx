'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { Z_INDEX } from '@/lib/theme/zIndex';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const tickingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!tickingRef.current) {
      requestAnimationFrame(() => {
        const next = window.scrollY > 500;
        if (next !== isVisibleRef.current) {
          isVisibleRef.current = next;
          setIsVisible(next);
        }
        tickingRef.current = false;
      });
      tickingRef.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        tap-target min-w-[44px] min-h-[44px] flex items-center justify-center
        scroll-to-top fixed right-4 p-3
        bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] md:bottom-[calc(2rem+env(safe-area-inset-bottom,0px))]
        bg-accent hover:bg-accent/90 text-paper rounded-full
        shadow-paper-lift hover-lift
        touch-polish transition-all duration-300 ${Z_INDEX.dropdown}
        active:scale-90
        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}
      `}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
