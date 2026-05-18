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

export const revalidate = 60;

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

      <div className="container mx-auto px-4 lg:px-6 pt-8 lg:pt-12 pb-16">

        <section
          aria-label="Today's masthead"
          className="relative mb-10 pb-10 border-b border-rule"
        >
          <div className="hidden md:flex items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="editorial-kicker mb-5">
                <span>{getIndianGreeting()}</span>
                <span aria-hidden="true" className="muted">·</span>
                <span className="muted">AI-verified Indian news</span>
              </p>
              <h1 className="font-display font-bold text-ink leading-[1.04] tracking-tight text-[clamp(2.5rem,5vw,4.75rem)]">
                A calmer, smarter front page for India.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
                Every story cross-referenced across multiple trusted Indian
                publications, scored for credibility, and rewritten without
                ads or noise.
              </p>
            </div>
            <LiveClock variant="hero" />
          </div>


          <div className="md:hidden">
            <p className="editorial-kicker mb-4">
              <span>{getIndianGreeting()}</span>
            </p>
            <h1 className="font-display font-bold text-ink leading-[1.06] tracking-tight text-[clamp(2.25rem,8vw,3rem)]">
              A calmer, smarter front page for India.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Every story cross-referenced, scored for credibility, and
              rewritten without ads or noise.
            </p>
          </div>

          {verifiedToday > 0 && (
            <p className="mt-7 inline-flex items-center gap-2.5 text-xs">
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0">
                <span className="absolute inset-0 rounded-full bg-accent/60 animate-ping" aria-hidden="true" />
              </span>
              <AnimatedCounter
                value={verifiedToday}
                className="font-bold text-ink tabular-nums"
              />
              <span className="font-medium text-muted">
                {verifiedToday === 1 ? 'story verified in the last 24 hours' : 'stories verified in the last 24 hours'}
              </span>
            </p>
          )}
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
          <h2 className="section-rule mb-7">
            <span>Latest News</span>
            <span className="ml-auto editorial-kicker text-[10px]">
              <span className="muted">Live updates</span>
            </span>
          </h2>
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
