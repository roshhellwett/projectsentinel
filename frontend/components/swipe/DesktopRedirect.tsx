'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const MOBILE_BREAKPOINT_PX = 768;

export function DesktopRedirect() {
  const router = useRouter();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT_PX}px)`);
    if (mq.matches && !redirectedRef.current) {
      redirectedRef.current = true;
      router.replace('/');
      return;
    }
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches && !redirectedRef.current) {
        redirectedRef.current = true;
        router.replace('/');
      }
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else if (mq.addListener) {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
    return () => {};
  }, [router]);

  return null;
}
