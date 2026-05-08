import type { MetadataRoute } from 'next';

const VALID_CATEGORIES = ['politics', 'business', 'sports', 'crime', 'science', 'health', 'tech', 'world'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://indiaverified.vercel.app';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${siteUrl}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = VALID_CATEGORIES.map((category) => ({
    url: `${siteUrl}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
