'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function RouteChangeAnnouncer() {
  const pathname = usePathname();
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const title = document.title || 'India Verified';
    setDisplay(title);
  }, [pathname]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {display ? `Navigated to ${display}` : ''}
    </div>
  );
}
