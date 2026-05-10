/**
 * Admin post table with actions
 */

'use client';

import { useState } from 'react';
import { Post } from '@/types';
import { CategoryTag } from '@/components/news/CategoryTag';
import { CredibilityBadge } from '@/components/news/CredibilityBadge';
import { formatDate } from '@/lib/utils/formatDate';
import { CorrectionForm } from './CorrectionForm';

interface PostTableProps {
  posts: Post[];
}

export function PostTable({ posts }: PostTableProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [correctionType, setCorrectionType] = useState<'corrected' | 'retracted'>('corrected');
  
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-950/[0.10]">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Headline</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Category</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Score</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Published</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-slate-950/[0.08]">
                <td className="py-3 px-4">
                  <a 
                    href={`/news/${post.id}/`}
                    className="text-slate-950 hover:text-accent transition-colors line-clamp-1"
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
                  <span className={`text-sm ${
                    post.status === 'published' ? 'text-cred-high' :
                    post.status === 'corrected' ? 'text-cred-mid' :
                    'text-cred-low'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-500">
                  {formatDate(post.published_at)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setCorrectionType('corrected');
                      }}
                      className="text-xs px-3 py-1 bg-cred-mid/20 text-cred-mid rounded hover:bg-cred-mid/30 transition-colors"
                    >
                      Correct
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setCorrectionType('retracted');
                      }}
                      className="text-xs px-3 py-1 bg-cred-low/20 text-cred-low rounded hover:bg-cred-low/30 transition-colors"
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
        />
      )}
    </>
  );
}
