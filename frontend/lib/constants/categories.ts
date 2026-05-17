// last edited 2026-05-17 by roshhellwett

export const CATEGORIES = [
  { slug: 'politics', label: 'Politics' },
  { slug: 'business', label: 'Business' },
  { slug: 'sports', label: 'Sports' },
  { slug: 'crime', label: 'Crime' },
  { slug: 'science', label: 'Science' },
  { slug: 'health', label: 'Health' },
  { slug: 'tech', label: 'Tech' },
  { slug: 'world', label: 'World' },
  { slug: 'entertainment', label: 'Entertainment' },
  { slug: 'education', label: 'Education' },
] as const;

export type CategorySlug = typeof CATEGORIES[number]['slug'];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);
