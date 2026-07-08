'use client';

import { useState, useEffect, type ReactNode } from 'react';

export function PageEntrance({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={mounted ? 'animate-entrance-slide' : ''}>
      {children}
    </div>
  );
}
