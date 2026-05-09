import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPostById, fetchPosts } from '@/lib/supabase/server';
import { CategoryTag } from '@/components/news/CategoryTag';
import { CredibilityBadge } from '@/components/news/CredibilityBadge';
import { SourceLinks } from '@/components/news/SourceLinks';
import { CorrectionsNotice } from '@/components/news/CorrectionsNotice';
import { ShareButtons } from '@/components/news/ShareButtons';
import { RelatedStories } from '@/components/news/RelatedStories';
import { ReadingTime } from '@/components/news/ReadingTime';
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
      url: `${siteUrl}/news/${post.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.headline,
      description: post.summary,
    },
    alternates: {
      canonical: `${siteUrl}/news/${post.id}`,
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
      { name: post.category.charAt(0).toUpperCase() + post.category.slice(1), url: `${siteUrl}/category/${post.category}` },
      { name: post.headline, url: `${siteUrl}/news/${post.id}` },
    ]),
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdToString(jsonLd),
        }}
      />

      {/* Decorative Background */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-saffron-light/40 via-background to-background pointer-events-none dark:from-india-saffron/[0.04] dark:via-slate-950 dark:to-slate-950 -z-10" />
      <div className="absolute top-40 right-20 w-80 h-80 bg-india-saffron/[0.06] rounded-full blur-3xl pointer-events-none dark:bg-india-saffron/[0.03] -z-10" />
      <div className="absolute top-80 -left-20 w-96 h-96 bg-accent/[0.04] rounded-full blur-3xl pointer-events-none dark:bg-accent/[0.02] -z-10" />

      <div className="container mx-auto px-4 pt-10 max-w-4xl">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-india-saffron dark:text-slate-400 dark:hover:text-india-saffron mb-8 transition-colors group"
        >
          <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-india-saffron/10 transition-colors">
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
        <article className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden mb-12 ${isRetracted ? 'opacity-60' : ''}`}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-india-saffron via-orange-400 to-accent" />
          
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <CategoryTag category={post.category} />
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at)}
              </span>
              <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                <ReadingTime text={post.summary} />
              </span>
            </div>

            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-[1.15] mb-8 tracking-tight ${isRetracted ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
              {post.headline}
            </h1>

            {/* Score Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-slate-100 dark:border-slate-800 mb-8 bg-slate-50/50 dark:bg-slate-800/20 -mx-8 px-8">
              <div className="flex flex-wrap items-center gap-4">
                <CredibilityBadge score={post.credibility_score} showTooltip />
                <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <Database className="w-4 h-4 text-india-saffron" />
                  {post.source_count} Sources Verified
                </div>
              </div>
              <ShareButtons headline={post.headline} url={`${siteUrl}/news/${post.id}`} />
            </div>

            {/* Summary / Body */}
            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              <p className="text-xl md:text-2xl leading-relaxed text-slate-800 dark:text-slate-200 font-serif">
                {post.summary}
              </p>
            </div>
          </div>
        </article>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Reason Card */}
          <div className="md:col-span-2 bg-saffron-light/30 dark:bg-india-saffron/5 rounded-3xl p-8 border border-india-saffron/20 dark:border-india-saffron/10 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-india-saffron/10">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-india-saffron" />
                AI Credibility Analysis
              </h2>
              <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
                Score: {post.credibility_score}/100
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                {post.credibility_reason}
              </p>
            </div>
          </div>

          {/* Sources Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Database className="w-5 h-5 text-accent" />
              Original Sources
            </h2>
            <SourceLinks sources={post.sources} />
          </div>
        </div>

        {/* Transparency Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-12">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-center">
            How This Story Was Built
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Cross-Referenced</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{post.source_count} Sources</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
                <span className="font-bold text-sm leading-none tracking-tighter">AI</span>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Unbiased Analysis</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-2">
                <span className="text-lg">⚡</span>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Auto-Published</span>
            </div>
          </div>
        </div>

        {/* Related Stories */}
        <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-india-saffron to-accent" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Related News
            </h2>
          </div>
          <RelatedStories posts={relatedPosts.posts} currentPostId={post.id} />
        </div>
      </div>
    </div>
  );
}
