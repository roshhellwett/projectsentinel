import { fetchPosts } from '@/lib/supabase/server';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://indiaverified.vercel.app';
  const { posts } = await fetchPosts(1, 50);

  const items = posts.map((post) => `
    <item>
      <title><![CDATA[${post.headline}]]></title>
      <description><![CDATA[${post.summary}]]></description>
      <link>${siteUrl}/news/${post.id}</link>
      <guid isPermaLink="true">${siteUrl}/news/${post.id}</guid>
      <category>${post.category}</category>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      <source url="${siteUrl}/rss.xml">India Verified</source>
    </item>
  `).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>India Verified - AI-Verified Indian News</title>
    <link>${siteUrl}</link>
    <description>Fully automated, AI-powered Indian news aggregator. Every story verified through cross-referencing multiple trusted sources.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/favicon.svg</url>
      <title>India Verified</title>
      <link>${siteUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
