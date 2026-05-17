'use client';

// last edited 2026-05-17 by roshhellwett

import { useEffect } from 'react';
import { useReadPosts } from '@/lib/utils/readPosts';

interface MarkReadOnMountProps {
  postId: string;
}

export function MarkReadOnMount({ postId }: MarkReadOnMountProps) {
  const { markRead } = useReadPosts();

  useEffect(() => {
    if (postId) markRead(postId);
  }, [postId, markRead]);

  return null;
}
