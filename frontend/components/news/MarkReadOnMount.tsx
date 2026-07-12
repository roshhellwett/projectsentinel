"use client";

import { useEffect } from "react";
import { useReadPosts } from "@/lib/utils/readPosts";

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
