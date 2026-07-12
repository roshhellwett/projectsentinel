import type { MetadataRoute } from "next";
import { fetchSitemapArticles } from "@/lib/supabase/server";
import { CATEGORY_SLUGS } from "@/lib/constants/categories";
import { getServerCache, setServerCache } from "@/lib/api/serverCache";

export const revalidate = 3600;

async function fetchArticleUrls(): Promise<
  { id: string; published_at: string; category: string }[]
> {
  const cacheKey = "sitemap_articles_list";
  const cached =
    getServerCache<{ id: string; published_at: string; category: string }[]>(
      cacheKey,
    );
  if (cached) return cached;

  try {
    const articles = await fetchSitemapArticles();
    if (articles && articles.length > 0) {
      setServerCache(cacheKey, articles, 3600_000);
    }
    return articles || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://zenithopensourceprojects.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/how-it-works/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/search/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const articles = await fetchArticleUrls();

  const dynamicCategorySet = new Set(CATEGORY_SLUGS);
  articles.forEach((a) => {
    if (a.category)
      dynamicCategorySet.add(a.category.trim().toLowerCase() as any);
  });

  const categoryRoutes: MetadataRoute.Sitemap = Array.from(
    dynamicCategorySet,
  ).map((category) => ({
    url: `${siteUrl}/category/${category}/`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => {
    const d = new Date(article.published_at);
    return {
      url: `${siteUrl}/news/${article.id}/`,
      lastModified: isNaN(d.getTime()) ? new Date() : d,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
