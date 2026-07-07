import { Suspense } from 'react';
import { fetchLatestPost, fetchPostsCursor } from '@/lib/supabase/server';
import { HeroCard } from '@/components/news/HeroCard';
import { TrendingSection } from '@/components/news/TrendingSection';
import { InfiniteFeed } from '@/components/news/InfiniteFeed';
import { MastheadClient } from '@/components/home/MastheadClient';
import { FeedSectionHeader } from '@/components/home/FeedSectionHeader';
import { FeedSkeleton } from '@/components/news/InfiniteFeed';
import { websiteJsonLd, organizationJsonLd, jsonLdToString } from '@/lib/utils/structuredData';
import { dedupe } from '@/lib/utils/dedupe';

export const revalidate = 60;

async function MastheadSection() {
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
  const DAY_AGO = NOW - 24 * 3_600_000;
  const verifiedToday = allPosts.filter(
    (p) => new Date(p.published_at).getTime() >= DAY_AGO,
  ).length + (heroPost && new Date(heroPost.published_at).getTime() >= DAY_AGO ? 1 : 0);

  const avgScore = allPosts.length > 0 
    ? Math.round(allPosts.reduce((acc, p) => acc + p.credibility_score, 0) / allPosts.length)
    : 92;

  return <MastheadClient avgScore={avgScore} verifiedToday={verifiedToday} />;
}

async function HeroSection() {
  const heroPost = await fetchLatestPost();
  if (!heroPost) return null;

  return (
    <div id="latest" className="mb-12 scroll-mt-24">
      <HeroCard post={heroPost} badge="breaking" />
    </div>
  );
}

async function TrendingAndFeedSection() {
  const [, postsResult] = await Promise.all([
    fetchLatestPost(),
    fetchPostsCursor(undefined, 24),
  ]);

  const NOW = Date.now();
  const allPosts = dedupe(postsResult.posts);

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

  const feedPosts = allPosts.filter((post) => !trendingIds.has(post.id));

  return (
    <>
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
          excludeIds={trendingIdList}
        />
      </section>
    </>
  );
}

function TrendingFeedSkeleton() {
  return (
    <>
      <div className="mb-12">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[280px] flex-shrink-0">
              <FeedSkeleton />
            </div>
          ))}
        </div>
      </div>
      <section aria-label="Latest verified news" className="mt-10">
        <FeedSectionHeader />
        <div className="feed-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <FeedSkeleton key={i} />
          ))}
        </div>
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToString([websiteJsonLd(), organizationJsonLd()]),
        }}
      />

      <div className="relative z-10 px-4 sm:px-6 lg:px-10 pb-20 max-w-[1600px] mx-auto">
        <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-rule/20 mb-12" />}>
          <MastheadSection />
        </Suspense>

        <Suspense fallback={<HeroCardSkeleton />}>
          <HeroSection />
        </Suspense>

        <Suspense fallback={<TrendingFeedSkeleton />}>
          <TrendingAndFeedSection />
        </Suspense>
      </div>
    </div>
  );
}

function HeroCardSkeleton() {
  return (
    <div className="mb-12 premium-card animate-shimmer h-[400px] flex flex-col justify-end p-8">
      <div className="space-y-3 max-w-2xl">
        <div className="h-4 w-20 rounded bg-rule/60" />
        <div className="h-8 w-full rounded bg-rule/50" />
        <div className="h-8 w-3/4 rounded bg-rule/40" />
        <div className="h-4 w-1/2 rounded bg-rule/30" />
      </div>
    </div>
  );
}
