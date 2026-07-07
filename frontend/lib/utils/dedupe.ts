import { Post } from '@/types';

// Memoized headline normalization cache to avoid re-processing
const normCache = new Map<string, string>();

function normalizeHeadline(s: string): string {
  const cached = normCache.get(s);
  if (cached !== undefined) return cached;
  
  const result = s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u2018\u2019\u201C\u201D]/g, '')
    .replace(/[^\w\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (normCache.size < 1000) {
    normCache.set(s, result);
  }
  return result;
}

function stableKey(article: Post): string {
  if (!article.headline || article.headline.length <= 15) {
    return `id::${article.id}`;
  }
  const head = normalizeHeadline(article.headline);
  return head.length > 15 ? `${head}::${article.category || 'general'}` : `id::${article.id}`;
}

export function dedupe(articles: Post[]): Post[] {
  if (articles.length <= 1) return articles;

  const seenIds = new Set<string>();
  const seenHeads = new Map<string, true>();
  const result: Post[] = [];

  for (const a of articles) {
    if (!a?.id) continue;
    if (seenIds.has(a.id)) continue;
    seenIds.add(a.id);

    const key = a.headline && a.headline.length > 15 ? stableKey(a) : `id::${a.id}`;
    if (seenHeads.has(key)) continue;
    seenHeads.set(key, true);
    result.push(a);
  }

  return result;
}
