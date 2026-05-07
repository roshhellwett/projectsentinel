/**
 * Individual news post page
 * Optimized: Link components, proper breadcrumb semantics, smooth animations
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPostById } from '@/lib/supabase/server';
import { CategoryTag } from '@/components/news/CategoryTag';
import { CredibilityBadge } from '@/components/news/CredibilityBadge';
import { SourceLinks } from '@/components/news/SourceLinks';
import { CorrectionsNotice } from '@/components/news/CorrectionsNotice';
import { formatDate } from '@/lib/utils/formatDate';

interface NewsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPostById(id);

  if (!post) {
    return {
      title: 'Not Found - Sentinel News'
    };
  }

  return {
    title: `${post.headline} - Sentinel News`,
    description: post.summary,
    openGraph: {
      title: post.headline,
      description: post.summary,
      type: 'article',
      publishedTime: post.published_at
    }
  };
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { id } = await params;
  const post = await fetchPostById(id);

  if (!post) {
    notFound();
  }

  const isCorrected = post.status === 'corrected';
  const isRetracted = post.status === 'retracted';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-slate-950 transition-colors">
              Home
            </Link>
          </li>
          <li className="text-slate-300">/</li>
          <li>
            <Link href={`/category/${post.category}`} className="hover:text-slate-950 capitalize transition-colors">
              {post.category}
            </Link>
          </li>
        </ol>
      </nav>

      {isCorrected && (
        <CorrectionsNotice type="corrected" note={post.correction_note} />
      )}
      {isRetracted && (
        <CorrectionsNotice type="retracted" note={post.correction_note} />
      )}

      <div className="mb-4">
        <CategoryTag category={post.category} />
      </div>

      <h1 className={`text-3xl md:text-4xl font-semibold mb-6 leading-tight text-slate-950 ${isRetracted ? 'line-through opacity-50' : ''}`}>
        {post.headline}
      </h1>

      <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-slate-200">
        <CredibilityBadge score={post.credibility_score} showTooltip />
        <span className="text-slate-500">{post.source_count} sources</span>
        <span className="text-slate-500">{formatDate(post.published_at)}</span>
      </div>

      <div className={`mb-8 ${isRetracted ? 'opacity-50' : ''}`}>
        <p className="text-lg text-slate-700 leading-relaxed">
          {post.summary}
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 mb-8 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950 mb-3">
          Credibility Score: {post.credibility_score}/100
        </h2>
        <p className="text-slate-600">
          {post.credibility_reason}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-950 mb-4">
          Original Sources
        </h2>
        <SourceLinks sources={post.sources} />
      </div>

      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-sm font-semibold text-slate-600 mb-3">
          About this story
        </h3>
        <ul className="space-y-2 text-sm text-slate-500 list-none">
          <li className="flex items-start gap-2">
            <span className="text-success mt-0.5">&#10003;</span>
            Verified by cross-referencing {post.source_count} trusted sources
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success mt-0.5">&#10003;</span>
            AI-analyzed for credibility and bias
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success mt-0.5">&#10003;</span>
            Published automatically without human editing
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success mt-0.5">&#10003;</span>
            All source links provided for transparency
          </li>
        </ul>
      </div>
    </div>
  );
}
