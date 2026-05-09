export const CATEGORIES = [
  { slug: 'politics', label: 'Politics', emoji: '🏛️' },
  { slug: 'business', label: 'Business', emoji: '📈' },
  { slug: 'sports', label: 'Sports', emoji: '🏏' },
  { slug: 'crime', label: 'Crime', emoji: '🔍' },
  { slug: 'science', label: 'Science', emoji: '🔬' },
  { slug: 'health', label: 'Health', emoji: '🏥' },
  { slug: 'tech', label: 'Tech', emoji: '💻' },
  { slug: 'world', label: 'World', emoji: '🌏' },
  { slug: 'entertainment', label: 'Entertainment', emoji: '🎬' },
] as const;

export type CategorySlug = typeof CATEGORIES[number]['slug'];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);
