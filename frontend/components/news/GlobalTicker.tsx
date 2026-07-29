import { fetchPostsCursor } from "@/lib/supabase/server";
import { NewsTickerClient } from "./NewsTickerClient";

export async function GlobalTicker() {
  const { posts } = await fetchPostsCursor(undefined, 10);
  
  if (!posts || posts.length === 0) return null;
  
  // You can filter by credibility or time here, but latest 10 is usually good for a ticker.
  const tickerPosts = posts.filter(p => p.credibility_score > 70);

  if (tickerPosts.length === 0) return null;

  return <NewsTickerClient posts={tickerPosts} />;
}
