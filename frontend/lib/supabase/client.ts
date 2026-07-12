import { createBrowserClient } from "@supabase/ssr";
import { Post } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase browser environment variables are not configured",
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 5, // Limit events per second to conserve free tier quota
        },
      },
    });
  }
  return browserClient;
}

type PostCallback = (post: Post) => void;

class SharedRealtimeManager {
  private listeners = new Set<PostCallback>();
  private channel: ReturnType<
    ReturnType<typeof createBrowserClient>["channel"]
  > | null = null;
  private isPaused = false;
  private visibilityHandler: (() => void) | null = null;
  private networkHandler: (() => void) | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private maxReconnectDelay = 30000;

  public subscribe(callback: PostCallback) {
    this.listeners.add(callback);
    this.setupListeners();
    this.evaluateConnection();

    return {
      unsubscribe: () => {
        this.listeners.delete(callback);
        if (this.listeners.size === 0) {
          this.teardownConnection();
          this.removeListeners();
          this.clearReconnectTimer();
        }
      },
    };
  }

  private setupListeners() {
    if (typeof window === "undefined" || this.visibilityHandler) return;

    this.visibilityHandler = () => {
      if (document.visibilityState === "hidden") {
        this.isPaused = true;
        this.teardownConnection();
      } else if (document.visibilityState === "visible") {
        this.isPaused = false;
        this.reconnectAttempts = 0; // Reset on visibility change
        this.evaluateConnection();
      }
    };

    this.networkHandler = () => {
      if (!navigator.onLine) {
        this.isPaused = true;
        this.teardownConnection();
      } else {
        this.isPaused = false;
        this.reconnectAttempts = 0; // Reset on reconnect
        this.evaluateConnection();
      }
    };

    document.addEventListener("visibilitychange", this.visibilityHandler);
    window.addEventListener("offline", this.networkHandler);
    window.addEventListener("online", this.networkHandler);
  }

  private removeListeners() {
    if (typeof window === "undefined" || !this.visibilityHandler) return;
    document.removeEventListener("visibilitychange", this.visibilityHandler);
    if (this.networkHandler) {
      window.removeEventListener("offline", this.networkHandler);
      window.removeEventListener("online", this.networkHandler);
    }
    this.visibilityHandler = null;
    this.networkHandler = null;
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private evaluateConnection() {
    if (
      typeof window !== "undefined" &&
      (!navigator.onLine || document.visibilityState === "hidden")
    ) {
      return;
    }
    if (this.isPaused || this.listeners.size === 0 || this.channel) {
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      this.channel = supabase
        .channel("posts-live-singleton")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "posts",
            filter: "status=eq.published",
          },
          (payload) => {
            const newPost = payload.new as Post;
            this.listeners.forEach((cb) => {
              try {
                cb(newPost);
              } catch {
                /* ignore listener error */
              }
            });
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "posts",
            filter: "status=eq.published",
          },
          (payload) => {
            const updatedPost = payload.new as Post;
            this.listeners.forEach((cb) => {
              try {
                cb(updatedPost);
              } catch {
                /* ignore listener error */
              }
            });
          },
        )
        .subscribe((status, err) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.warn(
              "[realtime] Singleton subscription error:",
              status,
              err,
            );
            this.teardownConnection();
            // Exponential backoff reconnection
            this.clearReconnectTimer();
            const delay = Math.min(
              1000 * Math.pow(2, this.reconnectAttempts),
              this.maxReconnectDelay,
            );
            this.reconnectAttempts++;
            this.reconnectTimer = setTimeout(() => {
              this.reconnectTimer = null;
              this.evaluateConnection();
            }, delay);
          } else if (status === "SUBSCRIBED") {
            this.reconnectAttempts = 0;
          }
        });
    } catch (err) {
      console.warn("[realtime] Failed to connect channel:", err);
    }
  }

  private teardownConnection() {
    if (this.channel) {
      try {
        const supabase = getSupabaseBrowserClient();
        supabase.removeChannel(this.channel);
      } catch {
        // ignore removal errors
      }
      this.channel = null;
    }
  }
}

const sharedManager = new SharedRealtimeManager();

export function subscribeToPosts(callback: (post: Post) => void) {
  return sharedManager.subscribe(callback);
}
