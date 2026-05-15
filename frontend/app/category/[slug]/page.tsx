import { Suspense } from 'react';
import { fetchPosts } from '@/lib/supabase/server';
import { InfiniteFeed } from '@/components/news/InfiniteFeed';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { Skeleton } from '@/components/ui/Skeleton';
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

  return (
    <div className="container mx-auto px-4 lg:px-6 pt-10 pb-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${categoryName} News`,
            description: `AI-verified ${slug} news from multiple trusted Indian sources.`,
            url: `${siteUrl}/category/${slug}/`,
            publisher: { '@type': 'Organization', name: 'India Verified' },
          }),
        }}
      />

      <div className="mb-10">
        <CategoryBar />
      </div>

      <header className="premium-card mb-10 rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
        <div className="relative z-10">
          <p className="editorial-kicker mb-3">Category</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-950 mb-4">{categoryName}</h1>
          <p className="text-sm md:text-base leading-7 text-slate-600 max-w-xl">
            AI-verified {slug} stories cross-referenced across multiple trusted sources.
          </p>
        </div>
      </header>

      {isValidCategory ? (
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-[218px] rounded-[1.65rem]" />
            ))}
          </div>
        }>
          <CategoryGrid slug={slug} />
        </Suspense>
      ) : (
        <p className="rounded-2xl border border-slate-950/[0.08] bg-white/70 p-6 text-slate-600">
          This category does not exist yet.
        </p>
      )}
    </div>
  );
}
