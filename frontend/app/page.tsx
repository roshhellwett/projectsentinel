import { fetchLatestPost, fetchPosts } from '@/lib/supabase/server';
import { NewsGrid } from '@/components/news/NewsGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { HeroCard } from '@/components/news/HeroCard';
import { TrendingSection } from '@/components/news/TrendingSection';
import { websiteJsonLd, organizationJsonLd, jsonLdToString } from '@/lib/utils/structuredData';

export const revalidate = 60;

export default async function HomePage() {
  const [heroPost, postsResult] = await Promise.all([
    fetchLatestPost(),
    fetchPosts(1, 20)
  ]);
  const posts = heroPost
    ? postsResult.posts.filter(post => post.id !== heroPost.id)
    : postsResult.posts;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToString([websiteJsonLd(), organizationJsonLd()]),
        }}
      />

      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative">
        <div className="mb-12">
          <CategoryBar />
        </div>

        {heroPost ? (
          <HeroCard post={heroPost} />
        ) : (
          <Skeleton className="min-h-[350px] md:min-h-[400px] w-full rounded-2xl mb-16 animate-pulse bg-surface border border-slate-200 shadow-sm" />
        )}

        {posts.length > 0 && <TrendingSection posts={posts} />}

        <section className="mt-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-accent to-slate-600 tracking-tight">
              Latest Verified News
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-8" />
          </div>
          <NewsGrid posts={posts} />
        </section>
      </div>
    </div>
  );
}
