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
import { PageShell } from '@/components/layout/PageShell';

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithopensourceprojects.vercel.app';

interface NewsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPostById(id);

  if (!post) {
    return {
      title: 'Not Found - Zenith Open Source Projects'
    };
  }

  const ogImage = post.video_thumbnail || `${siteUrl}/opengraph-image.png`;

  return {
    title: post.headline,
    description: post.summary,
    openGraph: {
      title: post.headline,
      description: post.summary,
      type: 'article',
      publishedTime: post.published_at,
      url: `${siteUrl}/news/${post.id}/`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.headline,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.headline,
      description: post.summary,
      images: [ogImage],
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
    <div className="relative min-h-screen overflow-x-clip pb-0">
      <ReadingProgress targetSelector="#article-body" />
      <MarkReadOnMount postId={post.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToString(jsonLd),
        }}
      />

      <PageShell>
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-7 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group min-h-[44px]"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-rule/50 bg-paper-2/70 backdrop-blur-sm group-hover:border-accent/40 group-hover:bg-paper/70 transition-all">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
            <span className="hidden sm:inline">Back to all news</span>
          </Link>
          <div className="hidden lg:block">
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

        <article id="article-body" className={`relative max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-14 ${isRetracted ? 'opacity-60' : ''}`}>

          <span aria-hidden="true" className="block w-10 sm:w-12 h-[3px] bg-gradient-to-r from-accent via-accent/60 to-transparent rounded-full mb-4 sm:mb-7" />

          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1.5 mb-3 sm:mb-6">
            <CategoryTag category={post.category} />
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-muted">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {formatDate(post.published_at)}
            </span>
            <span className="inline-flex sm:hidden items-center gap-1 text-[10px] font-medium text-muted">
              <Clock className="w-3 h-3" />
              <ReadingTime text={post.summary} />
            </span>
          </div>

          <h1 className={`font-display font-bold text-ink tracking-[-0.03em] leading-[1.04] mb-4 sm:mb-9 text-[clamp(1.4rem,5.5vw,4rem)] ${isRetracted ? 'line-through text-muted' : ''}`}>
            {post.headline}
          </h1>

          <div className="mb-6 sm:mb-10 rounded-2xl border border-rule/50 glass-sm p-3 sm:p-6">
            <CredibilityBar score={post.credibility_score} />
            <div className="mt-3 sm:mt-5 flex flex-col gap-2 sm:gap-4 border-t border-rule pt-3 sm:pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                <Database className="w-4 h-4 text-accent" />
                {typeof post.source_count === 'number' && (
                  <>
                    <span className="tabular-nums">{post.source_count}</span>
                    <span className="text-muted uppercase tracking-[0.14em] text-[10px] font-bold">
                      {post.source_count === 1 ? 'source verified' : 'sources verified'}
                    </span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <BookmarkButton postId={post.id} variant="pill" stopPropagation={false} />
                <ShareButtons headline={post.headline} url={`${siteUrl}/news/${post.id}/`} />
              </div>
            </div>
          </div>

          <p className="font-display text-[15px] sm:text-[19px] md:text-[22px] leading-[1.6] sm:leading-[1.75] text-ink-soft first-letter:font-display first-letter:font-bold first-letter:text-[2.8em] sm:first-letter:text-[3.5em] first-letter:leading-[0.85] first-letter:float-left first-letter:mr-2 sm:first-letter:mr-3 first-letter:mt-1 first-letter:text-accent">
            {post.summary}
          </p>
        </article>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-10 sm:mb-16">
          <aside className="md:col-span-2 np-card glass-card p-3 sm:p-5 md:p-8">
            <span aria-hidden="true" className="absolute top-0 left-0 w-1 h-full bg-accent rounded-r-full" />
            <h2 className="font-display flex items-center gap-2 text-base sm:text-xl font-bold text-ink mb-2 sm:mb-4">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-accent" strokeWidth={2.2} />
              AI Credibility Analysis
            </h2>
            <p className="text-ink-soft leading-[1.6] sm:leading-[1.7] text-sm sm:text-base">
              {post.credibility_reason}
            </p>
          </aside>

          <aside className="np-card glass-card p-3 sm:p-5 md:p-8">
            <h2 className="font-display text-sm sm:text-base font-bold text-ink mb-3 sm:mb-5 flex items-center gap-2">
              <Database className="w-4 h-4 text-accent" />
              Original Sources
            </h2>
            <SourceLinks sources={post.sources} />
          </aside>
        </div>

        <div className="np-card glass-card p-4 sm:p-7 mb-8 sm:mb-12">
          <h3 className="text-[10px] sm:text-[11px] font-bold text-accent mb-3 sm:mb-5 uppercase tracking-[0.18em] text-center">
            How this story was built
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {[
              { label: 'Cross-Referenced', icon: <ShieldCheck className="w-4 h-4" /> },
              { label: `${post.source_count} Sources`, icon: <Database className="w-4 h-4" /> },
              { label: 'Unbiased AI', icon: <span className="font-bold text-[11px] leading-none">AI</span> },
              { label: 'Auto-Published', icon: <span className="text-base">&#9889;</span> },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center p-2 sm:p-3 rounded-xl hover:bg-paper transition-all duration-300 group/step">
                <div className="w-8 h-8 sm:w-10 sm:h-10 border border-rule/50 bg-paper/70 backdrop-blur-sm text-accent flex items-center justify-center mb-2 sm:mb-3 group-hover/step:border-accent/30 transition-all duration-300">
                  {item.icon}
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-ink">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div id="related-news" className="mt-8 sm:mt-14 pt-6 sm:pt-10 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rule to-transparent" />
          <h2 className="section-heading mb-5 sm:mb-7">
            Related stories
          </h2>
          <RelatedStories posts={relatedPosts.posts} currentPostId={post.id} />
        </div>
      </PageShell>
      <NextStoryPrompt posts={relatedPosts.posts} currentPostId={post.id} />
    </div>
  );
}
