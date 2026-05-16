/**
 * Application-wide constants
 */

export const APP_NAME = 'India Verified';
export const APP_DESCRIPTION = 'AI-Verified Indian News';
export const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

/**
 * Pagination & Feed Defaults
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
export const DEFAULT_SEARCH_LIMIT = 20;
export const MAX_SEARCH_LIMIT = 50;

/**
 * Caching & Performance
 */
export const FEED_REVALIDATE_SECONDS = 30; // ISR revalidation interval
export const POLL_INTERVAL_MS = 30_000; // Real-time subscription poll interval
export const QUEUE_THRESHOLD_PX = 220; // Scroll threshold for live update queue
export const AUTO_FLUSH_AT_SCROLL_Y = 140; // Auto-flush pending posts

/**
 * Persistent Storage Keys (localStorage)
 */
export const STORAGE_KEYS = {
  READ_POSTS: 'iv:readPosts:v1',
  SAVED_POSTS: 'iv:savedPosts:v1',
} as const;

/**
 * Persistent Storage Limits (FIFO eviction)
 */
export const STORAGE_LIMITS = {
  READ_POSTS_MAX: 500,
  SAVED_POSTS_MAX: 200,
} as const;

/**
 * Animation & Transition Speeds
 */
export const ANIMATION = {
  SPRING_STIFFNESS: 340,
  SPRING_DAMPING: 28,
  SPRING_MASS: 0.55,
  FADE_IN_DURATION: 0.5,
} as const;

/**
 * API Routes
 */
export const API_ROUTES = {
  POSTS: '/api/posts',
  SEARCH: '/api/search',
  ADMIN_AUTH: '/api/admin/auth',
  POST_BY_ID: (id: string) => `/api/post/${id}`,
  POSTS_BATCH: '/api/posts/batch',
} as const;

/**
 * UI Page Sizes
 */
export const PAGE_SIZES = {
  HOME_HERO: 20,
  CATEGORY_FEED: 20,
  SEARCH_RESULTS: 20,
  ADMIN_TABLE: 25,
} as const;
