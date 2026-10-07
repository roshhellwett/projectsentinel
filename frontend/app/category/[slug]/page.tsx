import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchPostsCursor } from "@/lib/supabase/server";
import { InfiniteFeed, FeedSkeleton } from "@/components/news/InfiniteFeed";
import { CATEGORY_SLUGS } from "@/lib/constants/categories";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PageShell } from "@/components/layout/PageShell";
import { EditorialPageHeader } from "@/components/layout/EditorialPageHeader";
import { TopicIndex } from "@/components/layout/TopicIndex";
import { TopicIllustration } from "@/components/visual/TopicIllustration";

export const revalidate = 60;
export const dynamicParams = false;

const VALID_CATEGORIES = CATEGORY_SLUGS;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://zenithopensourceprojects.vercel.app";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((slug) => ({ slug }));
}

function titleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  if (!(VALID_CATEGORIES as readonly string[]).includes(slug)) {
    return {
      title: "Category Not Found - India Verified",
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
      card: "summary_large_image",
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
  const { posts, hasMore } = await fetchPostsCursor(undefined, 20, slug);

  return (
    <InfiniteFeed
      initialPosts={posts}
      hasInitialMore={hasMore}
      category={slug}
    />
  );
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const isValidCategory = (VALID_CATEGORIES as readonly string[]).includes(
    slug,
  );
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
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${categoryName} News`,
            description: `AI-verified ${slug} news from multiple trusted Indian sources.`,
            url: `${siteUrl}/category/${slug}/`,
            publisher: { "@type": "Organization", name: "India Verified" },
          }),
        }}
      />

      <PageShell>
        <Breadcrumb items={[{ label: categoryName }]} className="mb-6" />

        <EditorialPageHeader kicker="The perspective / By topic" title={<>{categoryName}<span className="text-accent">.</span></>} description={`The latest in ${slug}, with the sources and context behind every headline.`} artwork={<TopicIllustration category={slug} />} />
        <div className="mb-8"><TopicIndex /></div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-fluid-sm items-stretch">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <FeedSkeleton />
                </div>
              ))}
            </div>
          }
        >
          <CategoryGrid slug={slug} />
        </Suspense>
      </PageShell>
    </div>
  );
}
