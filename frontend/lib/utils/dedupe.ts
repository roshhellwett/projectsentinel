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
  if (head.length > 15) {
    return `${head}::${article.category || 'general'}`;
  }
  
  return `id::${article.id}`;
}

export function dedupe(articles: Post[]): Post[] {
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

  return result;
}
