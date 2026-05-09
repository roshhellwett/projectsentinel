import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import { fetchAllPosts } from '@/lib/supabase/server';
import { PostTable } from '@/components/admin/PostTable';

export const metadata: Metadata = {
  title: 'Admin - India Verified'
};

async function requireAdmin() {
  const adminSecret = process.env.ADMIN_SECRET_TOKEN;
  const token = (await cookies()).get('admin_token')?.value;

  if (!adminSecret || !token) {
    redirect('/admin/login/');
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(adminSecret));
  } catch {
    redirect('/admin/login/');
  }
}

export default async function AdminPage() {
  await requireAdmin();
  const posts = await fetchAllPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Admin Dashboard</h1>

      <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
        <h2 className="text-xl font-semibold text-white mb-4">All Posts</h2>
        <PostTable posts={posts} />
      </div>
    </div>
  );
}
