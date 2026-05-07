/**
 * Browser Supabase client (uses anon key - public)
 */

import { createBrowserClient } from '@supabase/ssr';
import { Post } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single instance for the browser
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

// Real-time subscription helper
export function subscribeToPosts(callback: (post: Post) => void) {
  const supabase = getSupabaseBrowserClient();
  
  const subscription = supabase
    .channel('posts-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      },
      (payload) => {
        callback(payload.new as Post);
      }
    )
    .subscribe();
  
  return subscription;
}
