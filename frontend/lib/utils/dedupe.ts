/**
 * Deduplication utility for article arrays.
 *
 * Stable key priority: id → url → headline (slug).
 * In dev mode, logs a warning when duplicates are removed so they
 * are caught immediately during development.
 */

import { Post } from '@/types';

function stableKey(article: Post): string {
  return article.id ?? (article as unknown as Record<string, string>).url ?? article.headline;
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

function normalizeTitle(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function wordOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const shared = a.filter(w => setB.has(w)).length;
  return shared / Math.min(a.length, b.length);
}

export function dedupeByTitle(articles: Post[]): Post[] {
  const exact = dedupe(articles);
  const kept: Post[] = [];
  const removed: string[] = [];

  for (const article of exact) {
    let isDuplicate = false;
    const wordsA = normalizeTitle(article.headline);

    for (let i = 0; i < kept.length; i++) {
      const wordsB = normalizeTitle(kept[i].headline);
      if (wordOverlap(wordsA, wordsB) > 0.6) {
        isDuplicate = true;
        if (article.credibility_score > kept[i].credibility_score) {
          removed.push(kept[i].headline);
          kept[i] = article;
        } else {
          removed.push(article.headline);
        }
        break;
      }
    }

    if (!isDuplicate) {
      kept.push(article);
    }
  }

  if (removed.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `[dedupeByTitle] Removed ${removed.length} near-duplicate(s):\n  ${removed.join('\n  ')}`
    );
  }

  return kept;
}
