"""
Loop runner - runs the pipeline continuously until news is published.
Optimized: reuses Supabase client, handles errors gracefully.
"""
import os
import time
import sys
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client
from scheduler.jobs import run_pipeline

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_post_count():
    """Get current number of published posts."""
    result = supabase.table("posts").select("id", count="exact").execute()
    return result.count if result.count is not None else 0


def main():
    print("=" * 60)
    print("ProjectSentinel - Continuous Pipeline Runner")
    print("=" * 60)
    print(f"Started at: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print()

    initial_count = get_post_count()
    print(f"Current published posts: {initial_count}")
    print("Running pipeline in loop until news is published...")
    print("-" * 60)

    run_number = 0

    while True:
        run_number += 1
        print(f"\n{'=' * 60}")
        print(f"[{datetime.now(timezone.utc).strftime('%H:%M:%S')}] Pipeline Run #{run_number}")
        print(f"{'=' * 60}")

        try:
            run_pipeline()

            current_count = get_post_count()
            new_posts = current_count - initial_count

            if new_posts > 0:
                print(f"\n{'#' * 60}")
                print(f"SUCCESS! {new_posts} new post(s) published!")
                print(f"Total posts: {current_count}")
                print(f"{'#' * 60}")
                break
            else:
                print(f"\nNo new posts published yet.")
                print(f"Waiting 60 seconds before next run...")
                time.sleep(60)

        except KeyboardInterrupt:
            print("\n\nPipeline stopped by user.")
            sys.exit(0)
        except Exception as e:
            import traceback
            print(f"\nError during pipeline run: {e}")
            print(traceback.format_exc())
            print("Retrying in 60 seconds...")
            time.sleep(60)

    print(f"\n{'=' * 60}")
    print("Pipeline completed successfully!")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
