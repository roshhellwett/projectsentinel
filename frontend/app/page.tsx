import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { fetchLatestPost, fetchPostsCursor } from "@/lib/supabase/server";
import { HeroCard } from "@/components/news/HeroCard";
import { TrendingSection } from "@/components/news/TrendingSection";
import { InfiniteFeed, FeedSkeleton } from "@/components/news/InfiniteFeed";
import { MastheadClient } from "@/components/home/MastheadClient";
import { Briefing } from "@/components/home/Briefing";
import { FeedSectionHeader } from "@/components/home/FeedSectionHeader";
import { TopicIndex } from "@/components/layout/TopicIndex";
import { Reveal } from "@/components/layout/Reveal";
import { websiteJsonLd, organizationJsonLd, jsonLdToString } from "@/lib/utils/structuredData";
import { dedupe } from "@/lib/utils/dedupe";

export const revalidate = 60;

async function MastheadSection() {
  const { posts } = await fetchPostsCursor(undefined, 50);
  const uniquePosts = dedupe(posts);
  const dayAgo = Date.now() - 24 * 3_600_000;
  const verifiedToday = uniquePosts.filter(post => new Date(post.published_at).getTime() >= dayAgo).length;
  const avgScore = uniquePosts.length ? Math.round(uniquePosts.reduce((sum, post) => sum + post.credibility_score, 0) / uniquePosts.length) : null;
  return <MastheadClient avgScore={avgScore} verifiedToday={verifiedToday} />;
}

async function NewsroomSection() {
  const [hero, result] = await Promise.all([fetchLatestPost(), fetchPostsCursor(undefined, 24)]);
  const posts = dedupe(result.posts);
  const briefing = posts.filter(post => post.id !== hero?.id).slice(0, 3);
  const leadIds = new Set([...(hero ? [hero.id] : []), ...briefing.map(post => post.id)]);
  const trending = posts.filter(post => !leadIds.has(post.id)).map(post => {
    const ageHours = (Date.now() - new Date(post.published_at).getTime()) / 3_600_000;
    return { post, rank: post.credibility_score * 0.6 + Math.max(0, 1 - ageHours / 12) * 40 };
  }).sort((a, b) => b.rank - a.rank).slice(0, 6).map(item => item.post);
  const excludeIds = [...leadIds, ...trending.map(post => post.id)];
  const excluded = new Set(excludeIds);
  const feed = posts.filter(post => !excluded.has(post.id));

  return (
    <>
      {hero && (
        <Reveal className="py-9 sm:py-12" >
          <section id="latest" aria-label="The front page">
            <div className="section-header-premium">
              <div><span className="section-header-premium__mark">01 / In focus</span><h2>The front page</h2></div>
              <span className="font-mono text-[9px] text-muted hidden sm:inline">A story. Its sources. The context.</span>
            </div>
            <div className={briefing.length ? "lead-layout" : ""}>
              <HeroCard post={hero} badge={null} />
              <Briefing posts={briefing} />
            </div>
          </section>
        </Reveal>
      )}
      {trending.length > 0 && <Reveal className="mt-4"><TrendingSection posts={trending} /></Reveal>}
      <Reveal>
        <section className="method-note" aria-label="Our approach">
          <div><span className="editorial-kicker mb-2">The thinking behind the reading</span><h2>Trust is in the details.</h2></div>
          <p>Every story comes with its sources and an AI credibility analysis. You can follow the evidence, understand the score, and form your own view.</p>
          <Link href="/how-it-works" className="editorial-link">See how it works <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </section>
      </Reveal>
      <section id={!hero ? "latest" : "your-feed"} aria-label="Latest verified news">
        <FeedSectionHeader />
        <InfiniteFeed initialPosts={feed} hasInitialMore={result.hasMore} excludeIds={excludeIds} />
      </section>
    </>
  );
}

function NewsroomSkeleton() {
  return <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Loading stories">{Array.from({ length: 6 }, (_, index) => <FeedSkeleton key={index} />)}</div>;
}

export default function HomePage() {
  return (
    <div className="site-container pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdToString([websiteJsonLd(), organizationJsonLd()]) }} />
      <Suspense fallback={<div className="animate-shimmer h-[460px] mt-6" aria-label="Loading today's edition" />}><MastheadSection /></Suspense>
      <TopicIndex />
      <Suspense fallback={<NewsroomSkeleton />}><NewsroomSection /></Suspense>
    </div>
  );
}
