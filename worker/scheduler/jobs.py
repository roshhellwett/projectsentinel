"""
APScheduler job configuration and pipeline orchestration.
Optimized: batch operations, parallel fetching, singletons, proper timezone.
"""

import os
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import UTC, datetime

from archiver.old_post_archiver import OldPostArchiver
from fetcher.deduplicator import Deduplicator
from fetcher.factcheck_fetcher import FactCheckFetcher
from fetcher.gnews_fetcher import GNewsFetcher
from fetcher.newsapi_fetcher import NewsAPIFetcher
from fetcher.rss_fetcher import RSSFetcher
from logger.pipeline_logger import PipelineLogger
from publisher.supabase_publisher import SupabasePublisher
from rate_limiter.limiter import RateLimitExceededError
from sources.blocked_domains import is_blocked_domain
from verifier.cross_source_checker import CrossSourceChecker
from verifier.factcheck_matcher import FactCheckMatcher
from verifier.groq_verifier import GroqVerifier
from verifier.score_evaluator import ScoreEvaluator
from writer.groq_writer import GroqWriter
from writer.post_builder import PostBuilder


def _record_run_start(logger: PipelineLogger, start_time: datetime, mode: str) -> str | None:
    """Record pipeline run start in database. Returns run_id or None."""
    try:
        from database.client import get_supabase as _get_sb

        _sb = _get_sb()
        if _sb:
            _res = _sb.table("pipeline_runs").insert({"started_at": start_time.isoformat(), "mode": mode}).execute()
            if _res.data:
                return _res.data[0].get("id")
    except Exception as _e:
        logger.log("PIPELINE", f"Could not record pipeline run start: {_e}")
    return None


def _record_run_end(logger: PipelineLogger, run_id: str | None, duration: float, stats: dict) -> None:
    """Record pipeline run completion in database."""
    if not run_id:
        return
    try:
        from database.client import get_supabase as _get_sb

        _sb = _get_sb()
        if _sb:
            _sb.table("pipeline_runs").update(
                {
                    "completed_at": datetime.now(UTC).isoformat(),
                    "duration_seconds": round(duration, 1),
                    "stats": stats,
                }
            ).eq("id", run_id).execute()
    except Exception as _e:
        logger.log("PIPELINE", f"Could not record pipeline run completion: {_e}")


def run_pipeline(supplementary_only: bool = False, archive_only: bool = False) -> None:
    """
    Main pipeline function that orchestrates all steps.

    Args:
        supplementary_only: Only fetch from GNews/NewsAPI (every 4 hours)
        archive_only: Only run archive job (monthly)
    """
    logger = PipelineLogger()
    mode = "supplementary" if supplementary_only else ("archive" if archive_only else "full")
    logger.log("PIPELINE", "Starting pipeline run", {"mode": mode})

    start_time = datetime.now(UTC)
    run_id = _record_run_start(logger, start_time, mode)

    try:
        max_ai_groups = max(1, int(os.getenv("MAX_AI_GROUPS_PER_RUN", "8")))
    except (ValueError, TypeError):
        max_ai_groups = 8

    stats: dict = {
        "fetched": 0,
        "duplicates": 0,
        "blocked": 0,
        "false_claims": 0,
        "single_source": 0,
        "low_score": 0,
        "published": 0,
        "ai_groups_skipped": 0,
    }

    try:
        deduplicator = Deduplicator()
        factcheck_matcher = FactCheckMatcher()
        cross_source_checker = CrossSourceChecker()
        groq_verifier = GroqVerifier()
        groq_writer = GroqWriter()
        post_builder = PostBuilder()
        publisher = SupabasePublisher()

        if archive_only:
            archiver = OldPostArchiver()
            deleted_count = archiver.archive_old_posts()
            cleanup_counts = archiver.cleanup_pipeline_tables()
            logger.log("ARCHIVE", f"Archived {deleted_count} old posts", cleanup_counts)
            duration = (datetime.now(UTC) - start_time).total_seconds()
            _record_run_end(logger, run_id, duration, {"archived": deleted_count, **cleanup_counts})
            return

        all_articles: list[dict] = []

        rss_articles: list[dict] = []
        if not supplementary_only:
            rss_fetcher = RSSFetcher()
            rss_articles = rss_fetcher.fetch_all()
            all_articles.extend(rss_articles)
            logger.log("FETCH", f"Fetched {len(rss_articles)} articles from RSS feeds")

        if supplementary_only or len(rss_articles) == 0:
            with ThreadPoolExecutor(max_workers=2) as executor:
                futures = {
                    executor.submit(GNewsFetcher().fetch): "GNews",
                    executor.submit(NewsAPIFetcher().fetch): "NewsAPI",
                }
                for future in as_completed(futures):
                    name = futures[future]
                    try:
                        api_articles = future.result(timeout=30)
                        all_articles.extend(api_articles)
                        logger.log("FETCH", f"Fetched {len(api_articles)} articles from {name}")
                    except Exception as e:
                        logger.log("FETCH_ERROR", f"{name} failed: {str(e)}")

        factcheck_fetcher = FactCheckFetcher()
        new_fact_checks = factcheck_fetcher.update_known_false_claims()
        logger.log("FACTCHECK", f"Updated {new_fact_checks} known false claims")

        stats["fetched"] = len(all_articles)

        new_articles: list[dict] = []
        for article in all_articles:
            if deduplicator.is_new(article):
                new_articles.append(article)
            else:
                stats["duplicates"] += 1

        deduplicator.batch_insert_new_articles(new_articles)

        logger.log("DEDUPLICATE", f"{len(new_articles)} new articles after URL deduplication")

        if supplementary_only:
            msg = f"Supplementary fetch complete: stored {len(new_articles)} articles for next main run"
            logger.log("PIPELINE", msg)
            duration = (datetime.now(UTC) - start_time).total_seconds()
            stats["stored"] = len(new_articles)
            _record_run_end(logger, run_id, duration, stats)
            return

        title_deduped: list[dict] = []
        title_dup_count = 0
        for article in new_articles:
            if deduplicator.is_duplicate_by_title(article.get("headline", "")):
                deduplicator.log_discarded(article, "duplicate_title")
                deduplicator.mark_group_processed([article])
                title_dup_count += 1
            else:
                title_deduped.append(article)
        new_articles = title_deduped
        stats["duplicates"] += title_dup_count

        logger.log(
            "DEDUPLICATE",
            f"{len(new_articles)} articles after title dedup ({title_dup_count} title-dups removed)",
        )

        unblocked_articles: list[dict] = []
        for article in new_articles:
            if is_blocked_domain(article.get("source_url", "")):
                deduplicator.log_discarded(article, "blocked_domain")
                deduplicator.mark_group_processed([article])
                stats["blocked"] += 1
            else:
                unblocked_articles.append(article)

        logger.log("BLOCK_CHECK", f"{len(unblocked_articles)} articles after domain filtering")

        clean_articles: list[dict] = []
        for article in unblocked_articles:
            if factcheck_matcher.is_false_claim(article.get("headline", "")):
                deduplicator.log_discarded(article, "known_false_claim")
                deduplicator.mark_group_processed([article])
                stats["false_claims"] += 1
            else:
                clean_articles.append(article)

        logger.log("FACT_CHECK", f"{len(clean_articles)} articles after fact-check filtering")

        verified_groups = cross_source_checker.get_verified_groups(clean_articles)
        articles_in_groups = sum(len(g) for g in verified_groups)
        stats["single_source"] = len(clean_articles) - articles_in_groups

        logger.log("CROSS_SOURCE", f"{len(verified_groups)} article groups with 2+ sources")

        groups_to_process = verified_groups[:max_ai_groups]
        stats["ai_groups_skipped"] = max(0, len(verified_groups) - len(groups_to_process))

        if stats["ai_groups_skipped"]:
            logger.log("AI_BUDGET", f"Processing {len(groups_to_process)} of {len(verified_groups)} groups this run")

        for group in groups_to_process:
            representative_url = group[0].get("url", "unknown") if group else "unknown"
            representative_headline = group[0].get("headline", "unknown") if group else "unknown"
            try:
                try:
                    verification = groq_verifier.verify(group)
                except RateLimitExceededError:
                    logger.log("AI_BUDGET", "Daily Groq verification limit reached — stopping AI processing")
                    break
                except Exception as groq_err:
                    logger.log(
                        "ERROR",
                        "Groq verification failed — skipping story",
                        {"url": representative_url, "headline": representative_headline[:80], "error": str(groq_err)},
                    )
                    deduplicator.log_discarded_group(group, f"groq_error: {str(groq_err)[:120]}")
                    deduplicator.mark_group_processed(group)
                    continue

                score_result = ScoreEvaluator.evaluate(
                    groq_score=verification.get("score", 0),
                    source_articles=group,
                    fact_check_flags=[],
                )
                score = score_result["final_score"]
                if score < 65:
                    deduplicator.log_discarded_group(group, "low_credibility_score", score)
                    deduplicator.mark_group_processed(group)
                    stats["low_score"] += 1
                    continue

                headline = verification.get("headline")
                summary = verification.get("summary")

                if not headline or not summary:
                    try:
                        writing = groq_writer.write(
                            key_facts=verification.get("key_facts", []),
                            category=verification.get("category", "general"),
                        )
                        headline = writing["headline"]
                        summary = writing["summary"]
                    except RateLimitExceededError:
                        logger.log("AI_BUDGET", "Daily Groq writer limit reached — stopping AI processing")
                        break
                    except Exception as write_err:
                        logger.log(
                            "ERROR",
                            "Groq writer failed — skipping story",
                            {"url": representative_url, "error": str(write_err)},
                        )
                        deduplicator.log_discarded_group(group, f"groq_write_error: {str(write_err)[:120]}")
                        deduplicator.mark_group_processed(group)
                        continue

                post = post_builder.build(
                    headline=headline,
                    summary=summary,
                    category=verification.get("category", "general"),
                    credibility_score=score,
                    credibility_reason=verification.get("reason", ""),
                    source_articles=group,
                )

                if publisher.publish(post):
                    stats["published"] += 1
                    deduplicator.mark_group_processed(group)

            except Exception as e:
                logger.log(
                    "ERROR",
                    "Unexpected error processing group — skipping",
                    {"url": representative_url, "error": str(e)},
                )
                logger.log("ERROR", traceback.format_exc())
                continue

        duration = (datetime.now(UTC) - start_time).total_seconds()
        logger.log("COMPLETE", f"Pipeline completed in {duration:.1f}s", stats)
        _record_run_end(logger, run_id, duration, stats)

    except Exception as e:
        logger.log("ERROR", f"Pipeline failed: {str(e)}")
        logger.log("ERROR", traceback.format_exc())
        duration = (datetime.now(UTC) - start_time).total_seconds()
        _record_run_end(logger, run_id, duration, {**stats, "error": str(e)})
        raise
