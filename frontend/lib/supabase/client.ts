/**
 * Browser Supabase client (uses anon key - public)
 *
 * Exposes:
 *  • getSupabaseBrowserClient() — singleton browser client.
 *  • subscribeToPosts(cb)        — realtime INSERT+UPDATE subscription.
 *    Returns { unsubscribe(): void } with full channel teardown so
 *    InfiniteFeed can resubscribe cleanly on reconnect cycles.
 */

import { createBrowserClient } from '@supabase/ssr';
import { Post } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single instance for the browser
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase browser environment variables are not configured');
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return browserClient;
}

/**
 * Subscribe to new and newly-published posts via Supabase Realtime.
 *
 * Listens for:
 *  • INSERT with status=published — brand new published posts.
 *  • UPDATE — catches posts whose status flips to `published` after
 *    initial creation (worker pipeline first inserts as draft, then
 *    updates to published once verification passes).
 *
 * Each subscription gets a unique channel name (timestamped) so that
 * successive mount/unmount cycles in React Strict Mode don't collide.
 */
export function subscribeToPosts(callback: (post: Post) => void) {
  const supabase = getSupabaseBrowserClient();
  const channelName = `posts-live-${Date.now()}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        filter: 'status=eq.published',
      },
      (payload) => {
        callback(payload.new as Post);
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts',
        filter: 'status=eq.published',
      },
      (payload) => {
        callback(payload.new as Post);
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

