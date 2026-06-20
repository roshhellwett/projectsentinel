

import contextlib
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
from utils.groq_pool import get_groq_pool, get_verify_model_chain
from verifier.cross_source_checker import CrossSourceChecker
from verifier.factcheck_matcher import FactCheckMatcher
from verifier.groq_verifier import AllKeysExhaustedError, GroqVerifier
from verifier.score_evaluator import ScoreEvaluator
from writer.groq_writer import GroqWriter
from writer.post_builder import PostBuilder


def _budgeted_groups_per_run(logger: PipelineLogger, hard_cap: int) -> int:

    pool = get_groq_pool()
    if pool is None:
        return hard_cap

    chain = get_verify_model_chain()
    total_budget = sum(pool.remaining_daily_budget(model=m) for m in chain)
    if total_budget <= 0:
        return hard_cap

    active_model = next(
        (m for m in chain if pool.remaining_daily_budget(model=m) > 0),
        chain[0],
    )
    rate_per_min = pool.target_rate_per_minute(model=active_model, safety_factor=0.92)
    if rate_per_min <= 0:
        return hard_cap

    try:
        interval_seconds = max(60, int(os.getenv("PIPELINE_INTERVAL_SECONDS", "600")))
    except (ValueError, TypeError):
        interval_seconds = 600

    allowed = max(1, int(rate_per_min * (interval_seconds / 60.0)))
    clamped = min(hard_cap, allowed)

    if clamped < hard_cap:
        tiers_alive = pool.alive_tiers(model=active_model)
        seconds_left = pool.seconds_until_utc_reset()
        logger.log(
            "AI_BUDGET",
            f"Budget shaper: model={active_model}, tiers_alive={tiers_alive}, "
            f"chain_budget={total_budget} calls "
            f"(active_model_budget={pool.remaining_daily_budget(model=active_model)}), "
            f"reset_in={seconds_left / 3600:.1f}h, "
            f"target_rate={rate_per_min:.1f}/min, "
            f"interval={interval_seconds}s, "
            f"groups_this_run={clamped} (cap={hard_cap})",
        )
    return clamped

def _record_run_start(logger: PipelineLogger, start_time: datetime, mode: str) -> str | None:

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

        try:
            stale_hours = max(1, int(os.getenv("STALE_SINGLETON_HOURS", "4")))
        except (ValueError, TypeError):
            stale_hours = 4
        swept = deduplicator.sweep_stale_unprocessed(hours=stale_hours)
        if swept:
            logger.log("DEDUP", f"Swept {swept} stale singleton(s) older than {stale_hours}h")

        all_articles: list[dict] = []

        rss_articles: list[dict] = []
        if not supplementary_only:
            rss_fetcher = RSSFetcher()
            rss_articles = rss_fetcher.fetch_all()
            all_articles.extend(rss_articles)
            logger.log("FETCH", f"Fetched {len(rss_articles)} articles from RSS feeds")

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

        old_unprocessed = deduplicator.get_unprocessed_articles(limit=200)
        combined_articles = new_articles + old_unprocessed
        
        unique_combined = []
        seen_keys = set()
        for article in combined_articles:
            key = article.get("url_hash") or article.get("url")
            if not key or key in seen_keys:
                continue
            seen_keys.add(key)
            unique_combined.append(article)

        logger.log(
            "PIPELINE",
            f"Processing {len(unique_combined)} articles ({len(new_articles)} new, "
            f"{len(unique_combined) - len(new_articles)} old unprocessed)"
        )

        title_deduped: list[dict] = []
        title_dup_count = 0
        for article in unique_combined:
            if deduplicator.is_duplicate_by_title(article.get("headline", "")):
                deduplicator.log_discarded(article, "duplicate_title")
                deduplicator.mark_group_processed([article])
                title_dup_count += 1
            else:
                title_deduped.append(article)
        unique_combined = title_deduped
        stats["duplicates"] += title_dup_count

        logger.log(
            "DEDUPLICATE",
            f"{len(unique_combined)} articles after title dedup ({title_dup_count} title-dups removed)",
        )

        unblocked_articles: list[dict] = []
        for article in unique_combined:
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

        from difflib import SequenceMatcher
        unique_groups: list[list[dict]] = []
        seen_rep_headlines_lower: list[str] = []

        for grp in verified_groups:
            rep = grp[0].get("headline", "") if grp else ""
            rep_lower = rep.lower().strip()

            # Fast optimization: pre-calculate lowercased strings and run SequenceMatcher directly
            is_dup = False
            for seen_lower in seen_rep_headlines_lower:
                if rep_lower == seen_lower or SequenceMatcher(None, rep_lower, seen_lower).ratio() >= 0.75:
                    is_dup = True
                    break

            if is_dup:
                deduplicator.mark_group_processed(grp)
                logger.log("DEDUP", f"Skipped near-duplicate group: {rep[:70]}")
            else:
                unique_groups.append(grp)
                seen_rep_headlines_lower.append(rep_lower)
        verified_groups = unique_groups

        effective_cap = _budgeted_groups_per_run(logger, max_ai_groups)
        groups_to_process = verified_groups[:effective_cap]
        deferred_groups = verified_groups[effective_cap:]
        stats["ai_groups_skipped"] = len(deferred_groups)

        if stats["ai_groups_skipped"]:
            logger.log(
                "AI_BUDGET",
                f"Processing {len(groups_to_process)} of {len(verified_groups)} groups this run "
                f"(effective_cap={effective_cap}, hard_cap={max_ai_groups})",
            )
            if len(verified_groups) > max_ai_groups:
                hard_overflow = verified_groups[max_ai_groups:]
                for grp in hard_overflow:
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
                    except (RateLimitExceededError, AllKeysExhaustedError) as budget_err:
                        logger.log(
                            "AI_BUDGET",
                            f"Groq writer budget exhausted — stopping AI processing: {budget_err}",
                        )
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
        with contextlib.suppress(Exception):
            GroqVerifier.save_pool_stats()
