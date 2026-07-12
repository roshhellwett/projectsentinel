import { fetchPosts } from '@/lib/supabase/server';
import type { Post } from '@/types';
import { getServerCache, setServerCache } from '@/lib/api/serverCache';

export const revalidate = 900; 

export async function GET() {
  const cacheKey = 'rss_feed_xml';
  const cachedRss = getServerCache<string>(cacheKey);
  if (cachedRss) {
    return new Response(cachedRss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'X-Cache': 'HIT',
      },
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithopensourceprojects.vercel.app';
  let posts: Post[] = [];
  try {
    const result = await fetchPosts(1, 50);
    posts = result.posts ?? [];
  } catch {
    // Supabase unreachable during build — render empty feed
  }

  function escapeCdata(value: string): string {
    return (value || '').replace(/]]>/g, ']]]]><![CDATA[>');
  }

  const items = (posts || []).map((post) => `
    <item>
      <title><![CDATA[${escapeCdata(post.headline)}]]></title>
      <description><![CDATA[${escapeCdata(post.summary)}]]></description>
      <link>${siteUrl}/news/${post.id}/</link>
      <guid isPermaLink="true">${siteUrl}/news/${post.id}/</guid>
      <category>${post.category}</category>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
    </item>
  `).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[Zenith Open Source — AI-Verified Indian News by Roshhellwett]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[Fully automated, AI-powered Indian news aggregator by Roshhellwett and Zenith Open Source Projects. Every story verified through cross-referencing multiple trusted sources.]]></description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/favicon.svg</url>
      <title>Zenith Open Source Projects</title>
      <link>${siteUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

  if (posts && posts.length > 0) {
    setServerCache(cacheKey, rss, 900_000); // 15 min TTL
  }

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      'X-Cache': 'MISS',
    },
  });
}
