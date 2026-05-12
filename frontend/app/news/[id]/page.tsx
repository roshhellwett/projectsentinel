import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPostById, fetchPosts } from '@/lib/supabase/server';
import { CategoryTag } from '@/components/news/CategoryTag';
import { CredibilityBadge } from '@/components/news/CredibilityBadge';
import { SourceLinks } from '@/components/news/SourceLinks';
import { CorrectionsNotice } from '@/components/news/CorrectionsNotice';
import { ShareButtons } from '@/components/news/ShareButtons';
import { BookmarkButton } from '@/components/news/BookmarkButton';
import { RelatedStories } from '@/components/news/RelatedStories';
import { ReadingTime } from '@/components/news/ReadingTime';
import { ReadingProgress } from '@/components/ui/ReadingProgress';
import { formatDate } from '@/lib/utils/formatDate';
import { newsArticleJsonLd, breadcrumbJsonLd, jsonLdToString } from '@/lib/utils/structuredData';
import { ArrowLeft, Clock, ShieldCheck, Database, Calendar } from 'lucide-react';

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

interface NewsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPostById(id);

  if (!post) {
    return {
      title: 'Not Found - India Verified'
    };
  }

  return {
    title: post.headline,
    description: post.summary,
    openGraph: {
      title: post.headline,
      description: post.summary,
      type: 'article',
      publishedTime: post.published_at,
      url: `${siteUrl}/news/${post.id}/`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.headline,
      description: post.summary,
    },
    alternates: {
      canonical: `${siteUrl}/news/${post.id}/`,
    },
  };
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { id } = await params;
  const post = await fetchPostById(id);

  if (!post) {
    notFound();
  }

  const [relatedPosts] = await Promise.all([
    fetchPosts(1, 4, post.category),
  ]);

  const isCorrected = post.status === 'corrected';
  const isRetracted = post.status === 'retracted';

  const jsonLd = [
    newsArticleJsonLd(post),
    breadcrumbJsonLd([
      { name: 'Home', url: siteUrl },
      { name: post.category.charAt(0).toUpperCase() + post.category.slice(1), url: `${siteUrl}/category/${post.category}/` },
      { name: post.headline, url: `${siteUrl}/news/${post.id}/` },
    ]),
  ];

  return (
    <div className="relative min-h-screen overflow-hidden pb-12">
      <ReadingProgress targetSelector="#article-body" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToString(jsonLd),
        }}
      />

      {/* Decorative accent glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(10,132,255,0.14),transparent_60%)] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 pt-10 max-w-5xl">
        <Link 
          href="/" 
          className="touch-polish inline-flex items-center gap-2 rounded-full text-sm font-medium text-slate-500 hover:text-slate-950 mb-8 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 group"
        >
          <div className="p-1.5 rounded-full bg-white/70 border border-slate-950/[0.10] group-hover:bg-accent/15 group-hover:border-accent/30 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to all news
        </Link>

        {isCorrected && (
          <div className="mb-6">
            <CorrectionsNotice type="corrected" note={post.correction_note} />
          </div>
        )}
        {isRetracted && (
          <div className="mb-6">
            <CorrectionsNotice type="retracted" note={post.correction_note} />
          </div>
        )}

        {/* Article Header Card */}
        <article id="article-body" className={`premium-card relative rounded-[2rem] overflow-hidden mb-12 ${isRetracted ? 'opacity-60' : ''}`}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          
          <div className="p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <CategoryTag category={post.category} />
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white/70 border border-slate-950/[0.10] px-3 py-1.5 rounded-full">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.published_at)}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white/70 border border-slate-950/[0.10] px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                <ReadingTime text={post.summary} />
              </span>
            </div>

            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-slate-950 tracking-tighter leading-[1.05] mb-8 ${isRetracted ? 'line-through text-slate-500' : ''}`}>
              {post.headline}
            </h1>

            {/* Score Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-slate-950/[0.08] mb-8 bg-white/55 -mx-8 px-8">
              <div className="flex flex-wrap items-center gap-4">
                <CredibilityBadge score={post.credibility_score} showTooltip />
                <div className="hidden sm:block w-px h-6 bg-slate-950/10" />
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <Database className="w-3.5 h-3.5 text-accent" />
                  {post.source_count} Sources Verified
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <BookmarkButton postId={post.id} variant="pill" stopPropagation={false} />
                <ShareButtons headline={post.headline} url={`${siteUrl}/news/${post.id}/`} />
              </div>
            </div>

            {/* Summary / Body */}
            <div className="max-w-none">
              <p className="text-lg md:text-xl leading-9 text-slate-700 font-normal">
                {post.summary}
              </p>
            </div>
          </div>
        </article>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Reason Card */}
          <div className="md:col-span-2 premium-card premium-card-hover relative rounded-3xl p-8">
            <div className="absolute -right-4 -top-4 text-accent/10">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950 mb-4">
                <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(10,132,255,0.8)]" />
                AI Credibility Analysis
              </h2>
              <div className="inline-flex items-center gap-2 bg-white/70 border border-slate-950/[0.10] px-3 py-1 rounded-lg text-sm font-bold text-slate-950 mb-4">
                Score: {post.credibility_score}/100
              </div>
              <p className="text-slate-600 leading-relaxed text-base">
                {post.credibility_reason}
              </p>
            </div>
          </div>

          {/* Sources Card */}
          <div className="premium-card premium-card-hover rounded-3xl p-8">
            <h2 className="text-base font-bold text-slate-950 mb-5 flex items-center gap-2">
              <Database className="w-4 h-4 text-accent" />
              Original Sources
            </h2>
            <SourceLinks sources={post.sources} />
          </div>
        </div>

        {/* Transparency Banner */}
        <div className="premium-card premium-card-hover rounded-3xl p-6 mb-12">
          <h3 className="text-[11px] font-bold text-slate-500 mb-5 uppercase tracking-[0.18em] text-center">
            How This Story Was Built
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Cross-Referenced', icon: <ShieldCheck className="w-4 h-4" /> },
              { label: `${post.source_count} Sources`, icon: <Database className="w-4 h-4" /> },
              { label: 'Unbiased AI', icon: <span className="font-bold text-[11px] leading-none">AI</span> },
              { label: 'Auto-Published', icon: <span className="text-base">⚡</span> },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center p-2">
                <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent mb-2.5 shadow-[0_12px_30px_-18px_rgba(10,132,255,0.85)]">
                  {item.icon}
                </div>
                <span className="text-[11px] font-semibold text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related Stories */}
        <div className="mt-16 border-t border-slate-950/[0.08] pt-12">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-1 h-5 rounded-full bg-accent shadow-[0_0_10px_rgba(10,132,255,0.75)]" />
            <h2 className="text-xl font-semibold text-slate-950 tracking-tight">
              Related News
            </h2>
          </div>
          <RelatedStories posts={relatedPosts.posts} currentPostId={post.id} />
        </div>
      </div>
    </div>
  );
}
