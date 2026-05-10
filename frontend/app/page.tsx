import { fetchLatestPost, fetchPosts } from '@/lib/supabase/server';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { HeroCard } from '@/components/news/HeroCard';
import { TrendingSection } from '@/components/news/TrendingSection';
import { InfiniteFeed } from '@/components/news/InfiniteFeed';
import { websiteJsonLd, organizationJsonLd, jsonLdToString } from '@/lib/utils/structuredData';
import { dedupe } from '@/lib/utils/dedupe';

export const revalidate = 30;

export default async function HomePage() {
  const [heroPost, postsResult] = await Promise.all([
    fetchLatestPost(),
    fetchPosts(1, 20),
  ]);

  // Dedupe at ingestion — remove hero post and any DB-level dupes
  const allPosts = dedupe(
    heroPost
      ? postsResult.posts.filter((post) => post.id !== heroPost.id)
      : postsResult.posts,
  );

  // Trending: top 5 by credibility × freshness — these IDs will be
  // excluded from the Latest News feed to prevent the same card
  // appearing in both sections.
  const trendingIds = new Set(
    [...allPosts]
      .map((post) => {
        const ageHours = (Date.now() - new Date(post.published_at).getTime()) / 3_600_000;
        const freshness = Math.max(0, 1 - ageHours / 12);
        return { id: post.id, score: post.credibility_score * 0.6 + freshness * 40 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ id }) => id),
  );

  // Feed posts: everything EXCEPT hero and trending
  const feedPosts = allPosts.filter((post) => !trendingIds.has(post.id));

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
        {allPosts.length > 0 && <TrendingSection posts={allPosts} />}

        {/* Latest verified news — auto-loading infinite feed */}
        <section aria-label="Latest verified news">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 rounded-full bg-accent shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
            <h2 className="text-base font-semibold text-white tracking-tight">Latest News</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <InfiniteFeed
            initialPosts={feedPosts}
            initialCount={Math.max(0, postsResult.count - trendingIds.size - (heroPost ? 1 : 0))}
            excludeIds={trendingIds}
          />
        </section>
      </div>
    </div>
  );
}
