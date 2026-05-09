import { fetchLatestPost, fetchPosts } from '@/lib/supabase/server';
import { LoadMoreGrid } from '@/components/news/LoadMoreGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { HeroCard } from '@/components/news/HeroCard';
import { TrendingSection } from '@/components/news/TrendingSection';
import { LiveRefreshBanner } from '@/components/news/LiveRefreshBanner';
import { websiteJsonLd, organizationJsonLd, jsonLdToString } from '@/lib/utils/structuredData';

export const revalidate = 30;

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
      {heroPost && <LiveRefreshBanner latestPublishedAt={heroPost.published_at} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToString([websiteJsonLd(), organizationJsonLd()]),
        }}
      />

      {/* Subtle warm gradient background */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-saffron-light/30 via-background to-background pointer-events-none dark:from-india-saffron/[0.03] dark:via-slate-950 dark:to-slate-950" />

      {/* Decorative blob */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-india-saffron/[0.04] rounded-full blur-3xl pointer-events-none dark:bg-india-saffron/[0.02]" />
      <div className="absolute top-60 -left-20 w-72 h-72 bg-accent/[0.03] rounded-full blur-3xl pointer-events-none dark:bg-accent/[0.02]" />

      <div className="container mx-auto px-4 py-8 relative">
        <div className="mb-10">
          <CategoryBar />
        </div>

        {heroPost ? (
          <HeroCard post={heroPost} />
        ) : (
          <Skeleton className="min-h-[350px] md:min-h-[400px] w-full rounded-3xl mb-16 animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm" />
        )}

        {posts.length > 0 && <TrendingSection posts={posts} />}

        <section className="mt-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-india-saffron to-accent" />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Latest Verified News
              </h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-700 to-transparent ml-6" />
          </div>
          <LoadMoreGrid initialPosts={posts} initialCount={postsResult.count} />
        </section>
      </div>
    </div>
  );
}
