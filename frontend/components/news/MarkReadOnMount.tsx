'use client';

import { useEffect } from 'react';
import { useReadPosts } from '@/lib/utils/readPosts';

interface MarkReadOnMountProps {
  postId: string;
}

/**
 * Records a localStorage "read" flag for the given post as soon as this
 * component mounts. Used on the standalone article page (`/news/[id]/`)
 * so that visits from the Hero card, TrendingSection, share links, or
 * direct navigation are all tracked — not just visits via the feed
 * drawer. Without this, half the read state was invisibly lost.
 *
 * Rendered as a fragment (zero DOM cost). Runs once per mount because
 * the post ID can only change via a full route navigation, which
 * remounts the page.
 */
export function MarkReadOnMount({ postId }: MarkReadOnMountProps) {
  const { markRead } = useReadPosts();

  useEffect(() => {
    if (postId) markRead(postId);
  }, [postId, markRead]);

  return null;
}
