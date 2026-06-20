

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPostById, fetchPosts } from '@/lib/supabase/server';
import { CategoryTag } from '@/components/news/CategoryTag';
import { CredibilityBar } from '@/components/news/CredibilityBar';
import { SourceLinks } from '@/components/news/SourceLinks';
import { CorrectionsNotice } from '@/components/news/CorrectionsNotice';
import { ShareButtons } from '@/components/news/ShareButtons';
import { BookmarkButton } from '@/components/news/BookmarkButton';
import { RelatedStories } from '@/components/news/RelatedStories';
import { ReadingTime } from '@/components/news/ReadingTime';
import { ReadingProgress } from '@/components/ui/ReadingProgress';
import { MarkReadOnMount } from '@/components/news/MarkReadOnMount';
import { formatDate } from '@/lib/utils/formatDate';
import { newsArticleJsonLd, breadcrumbJsonLd, jsonLdToString } from '@/lib/utils/structuredData';
import { ArrowLeft, Clock, ShieldCheck, Database, Calendar } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { NextStoryPrompt } from '@/components/news/NextStoryPrompt';

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
      <MarkReadOnMount postId={post.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToString(jsonLd),
        }}
      />

      <div className="container mx-auto px-4 pt-10 max-w-5xl">
        <div className="flex items-center justify-between gap-3 mb-7 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded border border-rule bg-paper group-hover:border-ink transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            Back to all news
          </Link>
          <div className="hidden md:block">
            <Breadcrumb
              items={[
                { label: post.category.charAt(0).toUpperCase() + post.category.slice(1), href: `/category/${post.category}/` },
                { label: post.headline },
              ]}
            />
          </div>
        </div>

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

        <article id="article-body" className={`relative mb-10 md:mb-12 ${isRetracted ? 'opacity-60' : ''}`}>

          <span aria-hidden="true" className="block w-12 h-[2px] bg-accent mb-5" />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
            <CategoryTag category={post.category} />
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.published_at)}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted">
              <Clock className="w-3.5 h-3.5" />
              <ReadingTime text={post.summary} />
            </span>
          </div>

          <h1 className={`font-display font-bold text-ink tracking-tight leading-[1.04] mb-8 text-[clamp(2rem,4.6vw,3.75rem)] ${isRetracted ? 'line-through text-muted' : ''}`}>
            {post.headline}
          </h1>

          <div className="mb-9 rounded-md border border-rule bg-paper-2 p-4 sm:p-5">
            <CredibilityBar score={post.credibility_score} />
            <div className="mt-4 flex flex-col gap-3 border-t border-rule pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                <Database className="w-3.5 h-3.5 text-accent" />
                <span className="tabular-nums">{post.source_count}</span>
                <span className="text-muted uppercase tracking-[0.14em] text-[10px] font-bold">
                  {post.source_count === 1 ? 'source verified' : 'sources verified'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <BookmarkButton postId={post.id} variant="pill" stopPropagation={false} />
                <ShareButtons headline={post.headline} url={`${siteUrl}/news/${post.id}/`} />
              </div>
            </div>
          </div>

          <div className="max-w-[68ch]">
            <p className="font-display text-[18px] md:text-[20px] leading-[1.7] text-ink-soft first-letter:font-display first-letter:font-bold first-letter:text-[3.4em] first-letter:leading-[0.85] first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-accent">
              {post.summary}
            </p>
          </div>
        </article>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <aside className="md:col-span-2 relative premium-card p-5 sm:p-8">
            <span aria-hidden="true" className="absolute top-0 left-0 w-1 h-full bg-accent" />
            <h2 className="font-display flex items-center gap-2 text-xl font-bold text-ink mb-4">
              <ShieldCheck className="w-5 h-5 text-accent" strokeWidth={2.2} />
              AI Credibility Analysis
            </h2>
            <p className="text-ink-soft leading-[1.7] text-base">
              {post.credibility_reason}
            </p>
          </aside>

          <aside className="premium-card p-5 sm:p-8">
            <h2 className="font-display text-base font-bold text-ink mb-5 flex items-center gap-2">
              <Database className="w-4 h-4 text-accent" />
              Original Sources
            </h2>
            <SourceLinks sources={post.sources} />
          </aside>
        </div>

        <div className="premium-card bg-paper-2 p-6 mb-12">
          <h3 className="text-[11px] font-bold text-accent mb-5 uppercase tracking-[0.18em] text-center">
            How this story was built
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Cross-Referenced', icon: <ShieldCheck className="w-4 h-4" /> },
              { label: `${post.source_count} Sources`, icon: <Database className="w-4 h-4" /> },
              { label: 'Unbiased AI', icon: <span className="font-bold text-[11px] leading-none">AI</span> },
              { label: 'Auto-Published', icon: <span className="text-base">⚡</span> },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center p-2">
                <div className="w-9 h-9 rounded-full border border-rule-strong bg-paper text-accent flex items-center justify-center mb-2.5">
                  {item.icon}
                </div>
                <span className="text-[11px] font-semibold text-ink">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div id="related-news" className="mt-16 border-t border-rule pt-12">
          <h2 className="section-rule mb-7">
            Related stories
          </h2>
          <RelatedStories posts={relatedPosts.posts} currentPostId={post.id} />
        </div>
      </div>
      <NextStoryPrompt posts={relatedPosts.posts} currentPostId={post.id} />
    </div>
  );
}
