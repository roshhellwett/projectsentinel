import { fetchPosts } from '@/lib/supabase/server';

export const revalidate = 900; 

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithopensourceprojects.vercel.app';
  const { posts } = await fetchPosts(1, 50);

  function escapeCdata(value: string): string {
    return value.replace(/]]>/g, ']]]]><![CDATA[>');
  }

  const items = posts.map((post) => `
    <item>
      <title><![CDATA[${escapeCdata(post.headline)}]]></title>
      <description><![CDATA[${escapeCdata(post.summary)}]]></description>
      <link>${siteUrl}/news/${post.id}/</link>
      <guid isPermaLink="true">${siteUrl}/news/${post.id}/</guid>
      <category>${post.category}</category>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      <source url="${siteUrl}/rss.xml">Zenith Open Source Projects</source>
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

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
