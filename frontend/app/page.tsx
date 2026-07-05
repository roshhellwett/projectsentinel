import { fetchLatestPost, fetchPosts } from '@/lib/supabase/server';
import { HeroCard } from '@/components/news/HeroCard';
import { TrendingSection } from '@/components/news/TrendingSection';
import { InfiniteFeed } from '@/components/news/InfiniteFeed';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { LiveClock } from '@/components/layout/LiveClock';
import { websiteJsonLd, organizationJsonLd, jsonLdToString } from '@/lib/utils/structuredData';
import { dedupe } from '@/lib/utils/dedupe';
import { Zap, ShieldCheck, Flame, Sparkles, Radio } from 'lucide-react';

const IST_HOUR_FMT = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  hour12: false,
  timeZone: 'Asia/Kolkata',
});

function getIndianGreeting(): string {
  const hour = parseInt(IST_HOUR_FMT.format(new Date()), 10);
  if (Number.isNaN(hour)) return 'Welcome back';
  if (hour < 5) return 'Late night scrolling';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export const revalidate = 60;

export default async function HomePage() {
  const [heroPost, postsResult] = await Promise.all([
    fetchLatestPost(),
    fetchPosts(1, 50),
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

  // Calculate average credibility score of today's stories
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
        {/* ── Premium Editorial Masthead ─────────────────────────── */}
        <section
          aria-label="Today's stats masthead"
          className="relative my-6 sm:my-8 p-7 sm:p-9 rounded-2xl bg-paper border border-rule/60 shadow-card overflow-hidden"
        >
          {/* Ambient gradient backdrop */}
          <div 
            className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-[0.07] dark:opacity-[0.12] blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgb(var(--c-accent)), transparent 70%)' }}
            aria-hidden="true"
          />
          <div 
            className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full opacity-[0.05] dark:opacity-[0.08] blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgb(var(--c-glow-to)), transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl stagger-entry">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-[0.15em] border border-accent/15">
                  <Radio className="w-3 h-3 flex-shrink-0" />
                  <span>Live Verified Feed</span>
                </span>
                <span className="text-xs font-semibold text-muted">&middot; {getIndianGreeting()}</span>
              </div>

              <h1 className="font-display font-black text-ink leading-[1.04] tracking-[-0.025em] text-[clamp(2rem,4.5vw,3.5rem)] mb-4">
                Real-time news, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-purple-500 to-pink-500 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}>zero noise.</span>
              </h1>

              <p className="text-sm sm:text-base text-muted leading-relaxed max-w-xl">
                Every article is instantly cross-referenced across trusted Indian publications, scored for accuracy by AI, and served in a distraction-free feed.
              </p>
            </div>

            {/* Stats Pills & Clock */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end flex-shrink-0">
              <div className="flex items-center justify-between sm:justify-start gap-5 p-4 rounded-xl bg-paper-2/80 border border-rule/60 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-cred-high/10 text-cred-high">
                    <ShieldCheck className="w-5 h-5" strokeWidth={2} />
                  </span>
                  <div>
                    <div className="text-[10px] font-bold text-muted uppercase tracking-[0.12em]">Avg Credibility</div>
                    <div className="text-sm font-bold text-ink tabular-nums">{avgScore}% Verified</div>
                  </div>
                </div>

                <div className="h-9 w-px bg-rule/50 hidden sm:block" />

                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-accent/10 text-accent">
                    <Zap className="w-5 h-5" strokeWidth={2} />
                  </span>
                  <div>
                    <div className="text-[10px] font-bold text-muted uppercase tracking-[0.12em]">24h Updates</div>
                    <div className="text-sm font-bold text-ink flex items-center gap-1">
                      <AnimatedCounter value={verifiedToday} />
                      <span>stories</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-auto w-full sm:w-auto">
                <LiveClock variant="hero" className="w-full bg-paper-2/80 rounded-xl border border-rule/60 px-4 py-2.5 shadow-sm backdrop-blur-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Full-bleed Hero Card Section ───────────────────────── */}
        {heroPost && (
          <div id="latest" className="mb-12 scroll-mt-24">
            <HeroCard post={heroPost} badge="breaking" />
          </div>
        )}

        {/* ── Trending Carousel ──────────────────────────────────── */}
        {trendingPosts.length > 0 && (
          <div className="mb-12">
            <TrendingSection posts={trendingPosts} />
          </div>
        )}

        {/* ── Infinite Feed ──────────────────────────────────────── */}
        <section aria-label="Latest verified news" className="mt-10">
          <div className="flex items-center justify-between gap-4 mb-7 pb-4 border-b border-rule/60">
            <h2 className="flex items-center gap-2.5 font-display text-xl sm:text-2xl font-bold text-ink">
              <span className="p-1.5 rounded-lg bg-accent/10 text-accent">
                <Flame className="w-5 h-5" strokeWidth={2.2} />
              </span>
              <span>Your Verified Feed</span>
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted bg-paper-2 px-3 py-1.5 rounded-full border border-rule/60">
              <span className="w-1.5 h-1.5 rounded-full bg-cred-high animate-pulse" />
              Live Stream
            </span>
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
