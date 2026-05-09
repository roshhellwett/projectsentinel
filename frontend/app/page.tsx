import { fetchLatestPost, fetchPosts } from '@/lib/supabase/server';
import { Hero } from '@/components/layout/Hero';
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
    <div className="relative min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToString([websiteJsonLd(), organizationJsonLd()]),
        }}
      />

      {/* Brand hero with massive "Verified News" watermark */}
      <Hero />

      <div className="container mx-auto px-4 lg:px-6">
        {/* Category filter bar */}
        <div className="mb-10">
          <CategoryBar />
        </div>

        {/* Featured story */}
        {heroPost && (
          <div id="latest" className="mb-12 scroll-mt-24">
            <HeroCard post={heroPost} />
          </div>
        )}

        {/* Trending */}
        {posts.length > 0 && <TrendingSection posts={posts} />}

        {/* Latest verified news — auto-loading infinite feed */}
        <section aria-label="Latest verified news">
          <div className="flex items-center gap-3 mb-7">
            <h2 className="text-base font-semibold text-white tracking-tight">Latest Verified News</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <InfiniteFeed initialPosts={posts} initialCount={postsResult.count} />
        </section>
      </div>
    </div>
  );
}
