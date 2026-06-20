

import { Post } from '@/types';

function normalizeHeadline(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u2018\u2019\u201C\u201D]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stableKey(article: Post): string {
  const head = article.headline ? normalizeHeadline(article.headline) : '';
  return head || article.id;
}

export function dedupe(articles: Post[]): Post[] {
  const before = articles.length;
  const seenIds = new Set<string>();
  const seenHeads = new Map<string, Post>();
  const result: Post[] = [];
  for (const a of articles) {
    if (a.id && seenIds.has(a.id)) continue;
    const key = stableKey(a);
    if (seenHeads.has(key)) continue;
    seenIds.add(a.id);
    seenHeads.set(key, a);
    result.push(a);
  }
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
    // eslint-disable-next-line no-console
    console.info(
      `[dedupe] Removed ${removed} duplicate article(s):\n  ${dupes.join('\n  ')}`
    );
  }

  return result;
}
