"""
Loop runner - runs the pipeline continuously until news is published.
Optimized: reuses Supabase singleton, handles errors gracefully.
"""

import sys
import time
import traceback
from datetime import UTC, datetime

from dotenv import load_dotenv

from database.client import get_supabase, reset_client
from scheduler.jobs import run_pipeline

load_dotenv()


MAX_RUNS = 50
BASE_WAIT = 60
MAX_WAIT = 600


def get_post_count() -> int:
    """Get current number of published posts."""
    supabase = get_supabase()
    if not supabase:
        return 0
    try:
        # head=True returns only the count, without dragging every id into memory.
        result = supabase.table("posts").select("id", count="exact", head=True).execute()
        return result.count if result.count is not None else 0
    except Exception:
        return 0


def main():
    print("=" * 60)
    print("India Verified - Continuous Pipeline Runner")
    print("=" * 60)
    print(f"Started at: {datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print()

    initial_count = get_post_count()
    print(f"Current published posts: {initial_count}")
    print("Running pipeline in loop until news is published...")
    print("-" * 60)

    run_number = 0
    consecutive_errors = 0

    while run_number < MAX_RUNS:
        run_number += 1
        print(f"\n{'=' * 60}")
        print(f"[{datetime.now(UTC).strftime('%H:%M:%S')}] Pipeline Run #{run_number}/{MAX_RUNS}")
        print(f"{'=' * 60}")

        try:
            run_pipeline()
            consecutive_errors = 0

            current_count = get_post_count()
            new_posts = current_count - initial_count

            if new_posts > 0:
                print(f"\n{'#' * 60}")
                print(f"SUCCESS! {new_posts} new post(s) published!")
                print(f"Total posts: {current_count}")
                print(f"{'#' * 60}")
                break
            else:
                print("\nNo new posts published yet.")
                print(f"Waiting {BASE_WAIT}s before next run...")
                time.sleep(BASE_WAIT)

        except KeyboardInterrupt:
            print("\n\nPipeline stopped by user.")
            sys.exit(0)
        except Exception as e:
            consecutive_errors += 1
            wait = min(BASE_WAIT * (2 ** (consecutive_errors - 1)), MAX_WAIT)

            print(f"\nError during pipeline run: {e}")
            print(traceback.format_exc())

            # Reset Supabase client on repeated failures (connection may be stale)
            if consecutive_errors >= 3:
                print("Resetting Supabase client due to repeated failures...")
                reset_client()
                # Restart backoff/reset cycle so we don't reset on every subsequent loop.
                consecutive_errors = 0

            print(f"Retrying in {wait}s (consecutive errors: {consecutive_errors})...")
            time.sleep(wait)
    else:
        print(f"\nReached maximum run limit ({MAX_RUNS}). Stopping.")

    print(f"\n{'=' * 60}")
    print("Pipeline completed.")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
