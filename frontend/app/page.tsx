import { fetchLatestPost, fetchPosts } from '@/lib/supabase/server';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { HeroCard } from '@/components/news/HeroCard';
import { TrendingSection } from '@/components/news/TrendingSection';
import { InfiniteFeed } from '@/components/news/InfiniteFeed';
import { websiteJsonLd, organizationJsonLd, jsonLdToString } from '@/lib/utils/structuredData';

export const revalidate = 30;

export default async function HomePage() {
  const [heroPost, postsResult] = await Promise.all([
    fetchLatestPost(),
    fetchPosts(1, 20),
  ]);

  // Dedupe: hero post should not appear in the grid
  const posts = heroPost
    ? postsResult.posts.filter((post) => post.id !== heroPost.id)
    : postsResult.posts;

  return (
    <div className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToString([websiteJsonLd(), organizationJsonLd()]),
        }}
      />

      <div className="container mx-auto px-4 lg:px-6 pt-6 lg:pt-8">
        {/* Category filter bar */}
        <div className="mb-8">
          <CategoryBar />
        </div>

        {/* Featured story — always first */}
        {heroPost && (
          <div id="latest" className="mb-12 scroll-mt-24">
            <HeroCard post={heroPost} />
          </div>
        )}

        {/* Trending */}
        {posts.length > 0 && <TrendingSection posts={posts} />}

        {/* Latest verified news — auto-loading infinite feed */}
        <section aria-label="Latest verified news">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 rounded-full bg-accent shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
            <h2 className="text-base font-semibold text-white tracking-tight">Latest News</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <InfiniteFeed initialPosts={posts} initialCount={postsResult.count} />
        </section>
      </div>
    </div>
  );
}
