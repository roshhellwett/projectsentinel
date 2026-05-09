import { Suspense } from 'react';
import { fetchPosts } from '@/lib/supabase/server';
import { InfiniteFeed } from '@/components/news/InfiniteFeed';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { CATEGORY_SLUGS } from '@/lib/constants/categories';

export const revalidate = 30;
export const dynamicParams = true;

const VALID_CATEGORIES = CATEGORY_SLUGS;

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
    title: `${category} News - India Verified`,
    description: `AI-verified ${slug} news from multiple trusted Indian sources.`,
    openGraph: {
      title: `${category} News - India Verified`,
      description: `AI-verified ${slug} news from multiple trusted Indian sources.`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category} News - India Verified`,
      description: `Latest verified ${category} news from India. Every story verified across multiple sources.`,
    },
  };
}

async function CategoryGrid({ slug }: { slug: string }) {
  const { posts, count } = await fetchPosts(1, 20, slug);

  return <InfiniteFeed initialPosts={posts} initialCount={count} category={slug} />;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryName = titleCase(slug);
  const isValidCategory = (VALID_CATEGORIES as readonly string[]).includes(slug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://indiaverified.vercel.app';

  return (
    <div className="container mx-auto px-4 lg:px-6 pt-10 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${categoryName} News`,
            description: `AI-verified ${slug} news from multiple trusted Indian sources.`,
            url: `${siteUrl}/category/${slug}`,
            publisher: { '@type': 'Organization', name: 'India Verified' },
          }),
        }}
      />

      <div className="mb-10">
        <CategoryBar />
      </div>

      <header className="mb-10">
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-2">Category</p>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-3">{categoryName}</h1>
        <p className="text-sm text-zinc-400 max-w-xl">
          AI-verified {slug} stories cross-referenced across multiple trusted sources.
        </p>
      </header>

      {isValidCategory ? (
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-[200px] rounded-2xl border border-white/[0.06] bg-white/[0.02] animate-shimmer" />
            ))}
          </div>
        }>
          <CategoryGrid slug={slug} />
        </Suspense>
      ) : (
        <p className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 text-zinc-400">
          This category does not exist yet.
        </p>
      )}
    </div>
  );
}
