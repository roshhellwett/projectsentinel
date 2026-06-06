'use client';

import { useState, useCallback } from 'react';
import { Post } from '@/types';
import { NewsCard } from './NewsCard';
import { NewsDrawer } from './NewsDrawer';

interface Props {
  posts: Post[];
}

export function SearchResultsGrid({ posts }: Props) {
  const [selected, setSelected] = useState<Post | null>(null);
  const close = useCallback(() => setSelected(null), []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {posts.map((post) => (
          <NewsCard key={post.id} post={post} onClick={() => setSelected(post)} />
        ))}
      </div>
      <NewsDrawer
        post={selected}
        onClose={close}
        onSelectRelated={(next) => setSelected(next)}
      />
    </>
  );
}
