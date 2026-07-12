"use client";

import { useState, useCallback } from "react";
import { Post } from "@/types";
import { NewsCard } from "./NewsCard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useReadPosts } from "@/lib/utils/readPosts";
import { useDailyReadCount } from "@/lib/hooks/useDailyReadCount";
import dynamic from "next/dynamic";

const NewsDrawer = dynamic(
  () => import("./NewsDrawer").then((m) => m.NewsDrawer),
  { ssr: false },
);

interface SearchResultsGridProps {
  posts: Post[];
}

export function SearchResultsGrid({ posts }: SearchResultsGridProps) {
  const [selected, setSelected] = useState<Post | null>(null);
  const { readIds, markRead } = useReadPosts();
  const { recordRead } = useDailyReadCount();

  const handleOpen = useCallback(
    (post: Post) => {
      markRead(post.id);
      recordRead();
      setSelected(post);
    },
    [markRead, recordRead],
  );

  const close = useCallback(() => setSelected(null), []);

  return (
    <>
      <ErrorBoundary>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-stretch">
          {posts.map((post) => (
            <NewsCard
              key={post.id}
              post={post}
              onClick={() => handleOpen(post)}
              isRead={readIds.has(post.id)}
            />
          ))}
        </div>
      </ErrorBoundary>
      <NewsDrawer
        post={selected}
        onClose={close}
        onSelectRelated={(next) => handleOpen(next)}
      />
    </>
  );
}
