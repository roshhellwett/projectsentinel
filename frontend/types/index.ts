/** Represents the thematic category of a news article. */
export type Category = 
  | 'politics' | 'business' | 'sports' | 'crime' | 'science' 
  | 'health' | 'tech' | 'world' | 'entertainment' | 'education';

/** Indicates the editorial status of a post. */
export type PostStatus = 'published' | 'corrected' | 'retracted';

/** Represents an external news source referenced by a post. */
export interface Source {
  title?: string;
  name?: string;
  url: string;
}

/** Response shape for cursor-based posts API. */
export interface PostsCursorResponse {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** 
 * The core entity representing an AI-verified news post.
 * Contains the headline, summary, and verification metadata.
 */
export interface Post {
  id: string;
  headline: string;
  summary: string;
  category: Category;
  credibility_score: number;
  credibility_reason: string;
  source_count: number;
  sources: Source[];
  fact_check_flags: string[];
  status: PostStatus;
  correction_note: string | null;
  published_at: string;
  updated_at: string;
}

