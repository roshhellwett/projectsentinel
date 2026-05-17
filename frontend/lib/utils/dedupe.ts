// last edited 2026-05-17 by roshhellwett

import { Post } from '@/types';

function stableKey(article: Post): string {


  return article.id ?? article.headline;
}

export function dedupe(articles: Post[]): Post[] {
  const before = articles.length;
  const result = Array.from(
    new Map(articles.map((a) => [stableKey(a), a])).values()
  );
  const removed = before - result.length;

  if (removed > 0 && process.env.NODE_ENV === 'development') {
    const seen = new Map<string, number>();
    for (const a of articles) {
      const key = stableKey(a);
      seen.set(key, (seen.get(key) || 0) + 1);
    }
    const dupes = [...seen.entries()]
      .filter(([, count]) => count > 1)
      .map(([key, count]) => `"${key}" (×${count})`);
    console.warn(
      `[dedupe] Removed ${removed} duplicate article(s):\n  ${dupes.join('\n  ')}`
    );
  }

  return result;
}
