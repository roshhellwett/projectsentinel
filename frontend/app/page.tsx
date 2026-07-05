import { fetchLatestPost, fetchPostsCursor } from '@/lib/supabase/server';
import { HeroCard } from '@/components/news/HeroCard';
import { TrendingSection } from '@/components/news/TrendingSection';
import { InfiniteFeed } from '@/components/news/InfiniteFeed';
import { MastheadClient } from '@/components/home/MastheadClient';
import { FeedSectionHeader } from '@/components/home/FeedSectionHeader';
import { websiteJsonLd, organizationJsonLd, jsonLdToString } from '@/lib/utils/structuredData';
import { dedupe } from '@/lib/utils/dedupe';

export const revalidate = 60;

export default async function HomePage() {
  const [heroPost, postsResult] = await Promise.all([
    fetchLatestPost(),
    fetchPostsCursor(undefined, 50),
  ]);

  const allPosts = dedupe(
    heroPost
      ? postsResult.posts.filter((post) => post.id !== heroPost.id)
      : postsResult.posts,
  );

  const NOW = Date.now();
  const trendingPosts = [...allPosts]
    .map((post) => {
      const ageHours = (NOW - new Date(post.published_at).getTime()) / 3_600_000;
      const freshness = Math.max(0, 1 - ageHours / 12);
      return { post, score: post.credibility_score * 0.6 + freshness * 40 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ post }) => post);
  const trendingIdList = trendingPosts.map((p) => p.id);
  const trendingIds = new Set(trendingIdList);

  const DAY_AGO = NOW - 24 * 3_600_000;
  const verifiedToday = allPosts.filter(
    (p) => new Date(p.published_at).getTime() >= DAY_AGO,
  ).length + (heroPost && new Date(heroPost.published_at).getTime() >= DAY_AGO ? 1 : 0);

  const feedPosts = allPosts.filter((post) => !trendingIds.has(post.id));

  const avgScore = allPosts.length > 0 
    ? Math.round(allPosts.reduce((acc, p) => acc + p.credibility_score, 0) / allPosts.length)
    : 92;

  return (
    <div className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToString([websiteJsonLd(), organizationJsonLd()]),
        }}
      />

      <div className="relative z-10 px-4 sm:px-6 lg:px-10 pb-20 max-w-[1600px] mx-auto">
        <MastheadClient avgScore={avgScore} verifiedToday={verifiedToday} />

        {heroPost && (
          <div id="latest" className="mb-12 scroll-mt-24">
            <HeroCard post={heroPost} badge="breaking" />
          </div>
        )}

        {trendingPosts.length > 0 && (
          <div className="mb-12">
            <TrendingSection posts={trendingPosts} />
          </div>
        )}

        <section aria-label="Latest verified news" className="mt-10">
          <FeedSectionHeader />

          <InfiniteFeed
            initialPosts={feedPosts}
            hasInitialMore={postsResult.hasMore}
            excludeIds={[...trendingIdList, ...(heroPost ? [heroPost.id] : [])]}
          />
        </section>
      </div>
    </div>
  );
}
