/**
 * Category page - filtered news by category
 * Optimized: title-case function, static params
 */

import { Suspense } from 'react';
import { fetchPosts } from '@/lib/supabase/server';
import { NewsGrid } from '@/components/news/NewsGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { CategoryBar } from '@/components/layout/CategoryBar';

const VALID_CATEGORIES = ['politics', 'business', 'sports', 'crime', 'science', 'health', 'tech', 'world'] as const;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.map(slug => ({ slug }));
}

function titleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = titleCase(slug);
  return {
    title: `${category} News - Sentinel News`,
    description: `AI-verified ${slug} news from multiple trusted Indian sources.`
  };
}

async function CategoryGrid({ slug }: { slug: string }) {
  const { posts } = await fetchPosts(1, 20, slug);

  return <NewsGrid posts={posts} />;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryName = titleCase(slug);

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryBar />

      <h1 className="text-3xl font-medium mb-2">{categoryName} News</h1>
      <p className="text-gray-400 mb-8">
        AI-verified {slug} stories from multiple trusted sources
      </p>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg animate-pulse" />
          ))}
        </div>
      }>
        <CategoryGrid slug={slug} />
      </Suspense>
    </div>
  );
}
