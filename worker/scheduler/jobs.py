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
from fetcher.url_tools import title_similarity
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
from verifier.groq_verifier import AllKeysExhaustedError, GroqVerifier
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
        max_ai_groups = max(1, int(os.getenv("MAX_AI_GROUPS_PER_RUN", "12")))
    except (ValueError, TypeError):
        max_ai_groups = 12

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
        if archive_only:
            archiver = OldPostArchiver()
            deleted_count = archiver.archive_old_posts()
            cleanup_counts = archiver.cleanup_pipeline_tables()
            logger.log("ARCHIVE", f"Archived {deleted_count} old posts", cleanup_counts)
            duration = (datetime.now(UTC) - start_time).total_seconds()
            _record_run_end(logger, run_id, duration, {"archived": deleted_count, **cleanup_counts})
            return

        deduplicator = Deduplicator()
        factcheck_matcher = FactCheckMatcher()
        cross_source_checker = CrossSourceChecker()
        groq_verifier = GroqVerifier()
        groq_writer = GroqWriter()
        post_builder = PostBuilder()
        publisher = SupabasePublisher()

        all_articles: list[dict] = []

        rss_articles: list[dict] = []
        if not supplementary_only:
            rss_fetcher = RSSFetcher()
            rss_articles = rss_fetcher.fetch_all()
            all_articles.extend(rss_articles)
            logger.log("FETCH", f"Fetched {len(rss_articles)} articles from RSS feeds")

        # Supplementary fetch decision:
        #   - Always run when explicitly requested (the every-2h job).
        #   - On the main pipeline, only fall back when RSS returned nothing
        #     AND at least one supplementary pool still has quota for today.
        #     This prevents a transient RSS hiccup from burning the whole
        #     daily quota across the 144 ten-minute ticks per day.
        should_supplement = supplementary_only or (
            len(rss_articles) == 0
            and (GNewsFetcher.has_quota() or NewsAPIFetcher.has_quota())
        )

        if not should_supplement and len(rss_articles) == 0 and not supplementary_only:
            logger.log(
                "FETCH",
                "RSS returned 0 articles but supplementary pools are out of quota for today, skipping",
            )

        if should_supplement:
            tasks = []
            if GNewsFetcher.has_quota():
                tasks.append((GNewsFetcher().fetch, "GNews"))
            if NewsAPIFetcher.has_quota():
                tasks.append((NewsAPIFetcher().fetch, "NewsAPI"))

            if tasks:
                with ThreadPoolExecutor(max_workers=len(tasks)) as executor:
                    futures = {executor.submit(fn): name for fn, name in tasks}
                    for future in as_completed(futures):
                        name = futures[future]
                        try:
                            api_articles = future.result(timeout=30)
                            all_articles.extend(api_articles)
                            logger.log("FETCH", f"Fetched {len(api_articles)} articles from {name}")
                        except Exception as e:
                            logger.log("FETCH_ERROR", f"{name} failed: {str(e)}")
            else:
                logger.log("FETCH", "Supplementary requested but all keys exhausted, skipping API calls")

        # Only refresh known-false-claims for the full pipeline; supplementary
        # fetch just stores raw articles for the next main run.
        if not supplementary_only:
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

        # Mark single-source articles as processed so they don't re-appear every run
        grouped_hashes = {a.get("url_hash") for g in verified_groups for a in g if a.get("url_hash")}
        single_source_articles = [a for a in clean_articles if a.get("url_hash") and a["url_hash"] not in grouped_hashes]
        if single_source_articles:
            deduplicator.mark_group_processed(single_source_articles)

        # Pre-AI dedup: drop groups whose representative headline is a paraphrase
        # of an already-queued group (catches cases SequenceMatcher would miss at 0.80).
        unique_groups: list[list[dict]] = []
        seen_rep_headlines: list[str] = []
        for grp in verified_groups:
            rep = grp[0].get("headline", "") if grp else ""
            if any(title_similarity(rep, seen) >= 0.75 for seen in seen_rep_headlines):
                deduplicator.mark_group_processed(grp)
                logger.log("DEDUP", f"Skipped near-duplicate group: {rep[:70]}")
            else:
                unique_groups.append(grp)
                seen_rep_headlines.append(rep)
        verified_groups = unique_groups

        groups_to_process = verified_groups[:max_ai_groups]
        deferred_groups = verified_groups[max_ai_groups:]
        stats["ai_groups_skipped"] = len(deferred_groups)

        if stats["ai_groups_skipped"]:
            logger.log("AI_BUDGET", f"Processing {len(groups_to_process)} of {len(verified_groups)} groups this run")
            # Mark deferred groups as processed to prevent infinite re-processing backlog
            for grp in deferred_groups:
                deduplicator.mark_group_processed(grp)

        for group in groups_to_process:
            representative_url = group[0].get("url", "unknown") if group else "unknown"
            representative_headline = group[0].get("headline", "unknown") if group else "unknown"
            try:
                try:
                    verification = groq_verifier.verify(group)
                except (RateLimitExceededError, AllKeysExhaustedError) as budget_err:
                    logger.log("AI_BUDGET", f"Groq budget exhausted — stopping AI processing: {budget_err}")
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
                            category=verification.get("category", "world"),
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
                    category=verification.get("category", "world"),
                    credibility_score=score,
                    credibility_reason=verification.get("reason", ""),
                    source_articles=group,
                )

                published = publisher.publish(post)
                deduplicator.mark_group_processed(group)
                if published:
                    stats["published"] += 1
                else:
                    deduplicator.log_discarded_group(group, "publish_rejected_duplicate")

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
    finally:
        # Always persist key usage stats, even on failure
        try:
            GroqVerifier.save_pool_stats()
        except Exception:
            pass
