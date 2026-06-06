

export interface Source {
  title?: string;
  name?: string;
  url: string;
}

export type Category = 'politics' | 'business' | 'sports' | 'crime' | 'science' | 'health' | 'tech' | 'world' | 'entertainment' | 'education';

export type PostStatus = 'published' | 'corrected' | 'retracted';

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

