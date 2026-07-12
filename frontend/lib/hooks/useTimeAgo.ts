'use client';

import { useState, useEffect } from 'react';
import { formatTimeAgo } from '@/lib/utils/formatDate';

export function useTimeAgo(dateString: string): string {
  const [text, setText] = useState(() => formatTimeAgo(dateString));

  useEffect(() => {
    setText(formatTimeAgo(dateString));
    const id = setInterval(() => {
      setText(formatTimeAgo(dateString));
    }, 60000);
    return () => clearInterval(id);
  }, [dateString]);

  return text;
}
