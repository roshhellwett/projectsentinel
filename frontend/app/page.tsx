// last edited 2026-05-17 by roshhellwett

import { fetchLatestPost, fetchPosts } from '@/lib/supabase/server';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { HeroCard } from '@/components/news/HeroCard';
import { TrendingSection } from '@/components/news/TrendingSection';
import { InfiniteFeed } from '@/components/news/InfiniteFeed';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { LiveClock } from '@/components/layout/LiveClock';
import { websiteJsonLd, organizationJsonLd, jsonLdToString } from '@/lib/utils/structuredData';
import { dedupe } from '@/lib/utils/dedupe';

const IST_HOUR_FMT = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  hour12: false,
  timeZone: 'Asia/Kolkata',
});

function getIndianGreeting(): string {
  const hour = parseInt(IST_HOUR_FMT.format(new Date()), 10);
  if (Number.isNaN(hour)) return 'Welcome';
  if (hour < 5) return 'Late night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export const revalidate = 15;

export default async function HomePage() {
  const [heroPost, postsResult] = await Promise.all([
    fetchLatestPost(),
    fetchPosts(1, 20),
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
    .slice(0, 5)
    .map(({ post }) => post);
  const trendingIdList = trendingPosts.map((p) => p.id);
  const trendingIds = new Set(trendingIdList);



  const DAY_AGO = NOW - 24 * 3_600_000;
  const verifiedToday = allPosts.filter(
    (p) => new Date(p.published_at).getTime() >= DAY_AGO,
  ).length + (heroPost && new Date(heroPost.published_at).getTime() >= DAY_AGO ? 1 : 0);









  const feedPosts = allPosts.filter((post) => !trendingIds.has(post.id));

  return (
    <div className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToString([websiteJsonLd(), organizationJsonLd()]),
        }}
      />

      <div className="container mx-auto px-4 lg:px-6 pt-8 lg:pt-10 pb-14">
        <section className="relative mb-9 overflow-hidden rounded-[2rem] border border-slate-950/[0.10] bg-white/75 px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_30px_100px_-76px_rgba(139,127,240,0.55)] backdrop-blur-2xl md:px-10 md:py-10">
          <div className="animate-soft-float absolute -right-20 -top-28 h-72 w-72 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-32 left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

          <div className="hidden md:block absolute top-6 right-6 lg:top-8 lg:right-8 z-10">
            <LiveClock variant="hero" />
          </div>

          <div className="relative max-w-4xl">
            <p className="editorial-kicker mb-4">
              <span className="text-accent">{getIndianGreeting()}</span>
              <span className="mx-2 text-slate-400">·</span>
              <span>AI-verified Indian news</span>
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-slate-950 md:text-6xl lg:text-7xl">
              A calmer, smarter front page for India.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              Stories are cross-referenced, scored, and written without ads or noise.
            </p>
            {verifiedToday > 0 && (
              <div className="mt-6 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-slate-950/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <span className="relative inline-flex w-2 h-2 rounded-full bg-accent flex-shrink-0">
                  <span className="absolute inset-0 rounded-full bg-accent/55 animate-ping" aria-hidden="true" />
                </span>
                <AnimatedCounter
                  value={verifiedToday}
                  className="text-[12px] font-semibold text-slate-700 tabular-nums"
                />
                <span className="text-[12px] font-medium text-slate-500">
                  {verifiedToday === 1 ? 'story verified in the last 24 hours' : 'stories verified in the last 24 hours'}
                </span>
              </div>
            )}
          </div>
        </section>


        <div className="mb-8">
          <CategoryBar />
        </div>


        {heroPost && (
          <div id="latest" className="mb-12 scroll-mt-24">
            <HeroCard post={heroPost} />
          </div>
        )}


        {trendingPosts.length > 0 && <TrendingSection posts={trendingPosts} />}


        <section aria-label="Latest verified news">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 rounded-full bg-accent shadow-[0_0_10px_rgba(139,127,240,0.75)]" />
            <h2 className="text-xl font-semibold text-slate-950 tracking-normal">Latest News</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-950/10 to-transparent" />
          </div>
          <InfiniteFeed
            initialPosts={feedPosts}
            initialCount={Math.max(0, postsResult.count - trendingIdList.length - (heroPost ? 1 : 0))}
            excludeIds={[...trendingIdList, ...(heroPost ? [heroPost.id] : [])]}
          />
        </section>
      </div>
    </div>
  );
}
