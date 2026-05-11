import type { MetadataRoute } from 'next';
import { fetchPosts } from '@/lib/supabase/server';
import { CATEGORY_SLUGS } from '@/lib/constants/categories';

export const revalidate = 3600;

async function fetchArticleUrls(): Promise<{ id: string; published_at: string }[]> {
  try {
    // Paginate so the sitemap includes more than the latest page of articles.
    // fetchPosts caps each page at 50 rows; we walk up to ~1000 most-recent
    // posts which keeps the file well under Google's 50K-URL sitemap limit
    // while no longer dropping the bulk of the archive from search engines.
    const PAGE_SIZE = 50;
    const MAX_PAGES = 20;
    const collected: { id: string; published_at: string }[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { posts, count } = await fetchPosts(page, PAGE_SIZE);
      if (!posts.length) break;
      for (const p of posts) {
        collected.push({ id: p.id, published_at: p.published_at });
      }
      if (collected.length >= count) break;
    }
    return collected;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${siteUrl}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((category) => ({
    url: `${siteUrl}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }));

  const articles = await fetchArticleUrls();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/news/${article.id}`,
    lastModified: new Date(article.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
