"use client";

import { useState, useEffect } from "react";
import { Post } from "@/types";
import { CategoryTag } from "@/components/news/CategoryTag";
import { CredibilityBadge } from "@/components/news/CredibilityBadge";
import { formatDate } from "@/lib/utils/formatDate";
import { CorrectionForm } from "./CorrectionForm";

interface PostTableProps {
  posts: Post[];
}

export function PostTable({ posts }: PostTableProps) {
  const [items, setItems] = useState<Post[]>(posts || []);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [correctionType, setCorrectionType] = useState<
    "corrected" | "retracted"
  >("corrected");

  useEffect(() => {
    setItems(posts || []);
  }, [posts]);

  if (!items || items.length === 0) {
    return (
      <p className="py-8 text-center text-muted font-medium">No posts found.</p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-rule">
              <th
                scope="col"
                className="text-left py-3 px-4 text-sm font-medium text-muted"
              >
                Headline
              </th>
              <th
                scope="col"
                className="text-left py-3 px-4 text-sm font-medium text-muted"
              >
                Category
              </th>
              <th
                scope="col"
                className="text-left py-3 px-4 text-sm font-medium text-muted"
              >
                Score
              </th>
              <th
                scope="col"
                className="text-left py-3 px-4 text-sm font-medium text-muted"
              >
                Status
              </th>
              <th
                scope="col"
                className="text-left py-3 px-4 text-sm font-medium text-muted"
              >
                Published
              </th>
              <th
                scope="col"
                className="text-left py-3 px-4 text-sm font-medium text-muted"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((post) => (
              <tr
                key={post.id}
                className="border-b border-rule hover:bg-paper-2 transition-colors"
              >
                <td className="py-3 px-4">
                  <a
                    href={`/news/${post.id}/`}
                    className="text-ink hover:text-accent transition-colors line-clamp-1 font-medium"
                  >
                    {post.headline}
                  </a>
                </td>
                <td className="py-3 px-4">
                  <CategoryTag category={post.category} />
                </td>
                <td className="py-3 px-4">
                  <CredibilityBadge score={post.credibility_score} />
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-sm font-semibold ${
                      post.status === "published"
                        ? "text-cred-high"
                        : post.status === "corrected"
                          ? "text-amber-600"
                          : "text-cred-low"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-muted font-medium">
                  {formatDate(post.published_at)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setCorrectionType("corrected");
                      }}
                      className="tap-target min-h-[36px] text-xs px-3 py-1 bg-amber-100 text-amber-800 font-semibold rounded hover:bg-amber-200 transition-colors hover-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Correct
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setCorrectionType("retracted");
                      }}
                      className="tap-target min-h-[36px] text-xs px-3 py-1 bg-red-100 text-red-800 font-semibold rounded hover:bg-red-200 transition-colors hover-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Retract
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPost && (
        <CorrectionForm
          post={selectedPost}
          type={correctionType}
          onClose={() => setSelectedPost(null)}
          onSuccess={(updated) => {
            setItems((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p)),
            );
          }}
        />
      )}
    </>
  );
}
