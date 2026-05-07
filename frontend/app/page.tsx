/**
 * Homepage with hero card and news grid
 * Optimized: Link components, dedup hero from grid
 */

import { Suspense } from 'react';
import { fetchLatestPost, fetchPosts } from '@/lib/supabase/server';
import { NewsGrid } from '@/components/news/NewsGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { HeroCard } from '@/components/news/HeroCard';

export const revalidate = 60;

async function HeroSection() {
  const post = await fetchLatestPost();

  if (!post) {
    return null;
  }

  return <HeroCard post={post} />;
}

async function NewsGridSection({ heroId }: { heroId?: string }) {
  const { posts } = await fetchPosts(1, 20);
  const filteredPosts = heroId ? posts.filter(p => p.id !== heroId) : posts;

  return <NewsGrid posts={filteredPosts} />;
}

export default async function HomePage() {
  const heroPost = await fetchLatestPost();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Abstract Background Blobs (Subtle Indian Theme) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-india-saffron/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-slate-200/50 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-india-green/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-12">
          <CategoryBar />
        </div>

        <Suspense fallback={<Skeleton className="min-h-[350px] md:min-h-[400px] w-full rounded-[2rem] mb-16 animate-pulse bg-surface border border-slate-200 shadow-sm" />}>
          <HeroSection />
        </Suspense>

        <section className="mt-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-accent to-slate-600 tracking-tight">
              Latest Verified News
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-8" />
          </div>
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[210px] rounded-[1.25rem] animate-pulse bg-surface border border-slate-200 shadow-sm" />
              ))}
            </div>
          }>
            <NewsGridSection heroId={heroPost?.id} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
