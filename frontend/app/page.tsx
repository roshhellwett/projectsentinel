import { fetchLatestPost, fetchPosts } from '@/lib/supabase/server';
import { HomeClient } from '@/components/figma/HomeClient';
import { dedupe } from '@/lib/utils/dedupe';

export const revalidate = 30;

export default async function HomePage() {
  const [heroPost, postsResult] = await Promise.all([
    fetchLatestPost(),
    fetchPosts(1, 50),
  ]);

  const allPosts = dedupe(
    heroPost
      ? postsResult.posts.filter((post) => post.id !== heroPost.id)
      : postsResult.posts,
  );

  const trendingIds = allPosts.length > 5
    ? new Set(
        [...allPosts]
          .sort((a, b) => b.credibility_score - a.credibility_score)
          .slice(0, 5)
          .map(({ id }) => id),
      )
    : new Set<string>();

  const feedPosts = allPosts.filter((post) => !trendingIds.has(post.id));

  return (
    <HomeClient
      heroPost={heroPost}
      allPosts={allPosts}
      feedPosts={feedPosts}
      totalCount={postsResult.count}
      trendingIds={trendingIds}
    />
  );
}
