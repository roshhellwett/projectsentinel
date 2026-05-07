/**
 * Admin dashboard
 */

import { Metadata } from 'next';
import { fetchAllPosts } from '@/lib/supabase/server';
import { PostTable } from '@/components/admin/PostTable';

export const metadata: Metadata = {
  title: 'Admin - Sentinel News'
};

export default async function AdminPage() {
  const posts = await fetchAllPosts();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-medium mb-8">Admin Dashboard</h1>
      
      <div className="bg-surface rounded-xl p-6">
        <h2 className="text-xl font-medium mb-4">All Posts</h2>
        <PostTable posts={posts} />
      </div>
    </div>
  );
}
