import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchPosts } from '@/lib/supabase/server';
import { InfiniteFeed } from '@/components/news/InfiniteFeed';
import { Skeleton } from '@/components/ui/Skeleton';
import { CATEGORY_SLUGS } from '@/lib/constants/categories';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageShell } from '@/components/layout/PageShell';

export const revalidate = 60;
export const dynamicParams = false;

const VALID_CATEGORIES = CATEGORY_SLUGS;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.map(slug => ({ slug }));
}

function titleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  if (!(VALID_CATEGORIES as readonly string[]).includes(slug)) {
    return {
      title: 'Category Not Found - India Verified',
    };
  }

  const category = titleCase(slug);
  return {
    title: `${category} News - India Verified`,
    description: `AI-verified ${slug} news from multiple trusted Indian sources.`,
    openGraph: {
      title: `${category} News - India Verified`,
      description: `AI-verified ${slug} news from multiple trusted Indian sources.`,
      url: `${siteUrl}/category/${slug}/`,
      images: [
        {
          url: `${siteUrl}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: `${category} News`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category} News - India Verified`,
      description: `Latest verified ${category} news from India. Every story verified across multiple sources.`,
      images: [`${siteUrl}/opengraph-image.png`],
    },
    alternates: {
      canonical: `${siteUrl}/category/${slug}/`,
    },
  };
}

async function CategoryGrid({ slug }: { slug: string }) {
  const { posts, count } = await fetchPosts(1, 20, slug);

  return <InfiniteFeed initialPosts={posts} initialCount={count} category={slug} />;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const isValidCategory = (VALID_CATEGORIES as readonly string[]).includes(slug);
  if (!isValidCategory) {
    notFound();
  }

  const categoryName = titleCase(slug);

  return (
    <div className="relative min-h-screen">
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

      <PageShell>
        <Breadcrumb items={[{ label: categoryName }]} className="mb-6" />

        <header className="mb-10 pb-8 border-b border-rule">
          <span aria-hidden="true" className="block w-12 h-[2px] bg-accent rounded-full mb-5" />
          <p className="editorial-kicker mb-3">Category</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-ink mb-4">
            {categoryName}
          </h1>
          <p className="text-sm md:text-base text-muted max-w-xl leading-relaxed">
            AI-verified {slug} stories cross-referenced across multiple trusted sources.
          </p>
        </header>

        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-[218px] rounded-md" />
            ))}
          </div>
        }>
          <CategoryGrid slug={slug} />
        </Suspense>
      </PageShell>
    </div>
  );
}
