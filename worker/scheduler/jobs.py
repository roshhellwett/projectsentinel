"""
APScheduler job configuration and pipeline orchestration.
Optimized: batch operations, parallel fetching, singletons, proper timezone.
"""

import os
import traceback
from datetime import datetime, timezone, timedelta
from typing import Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

from fetcher.rss_fetcher import RSSFetcher
from fetcher.gnews_fetcher import GNewsFetcher
from fetcher.newsapi_fetcher import NewsAPIFetcher
from fetcher.factcheck_fetcher import FactCheckFetcher
from fetcher.deduplicator import Deduplicator
from sources.blocked_domains import is_blocked_domain
from verifier.factcheck_matcher import FactCheckMatcher
from verifier.cross_source_checker import CrossSourceChecker
from verifier.groq_verifier import GroqVerifier
from writer.groq_writer import GroqWriter
from writer.post_builder import PostBuilder
from publisher.supabase_publisher import SupabasePublisher
from archiver.old_post_archiver import OldPostArchiver
from logger.pipeline_logger import PipelineLogger


def run_pipeline(
    supplementary_only: bool = False,
    archive_only: bool = False
) -> None:
    """
    Main pipeline function that orchestrates all steps.

    Args:
        supplementary_only: Only fetch from GNews/NewsAPI (every 4 hours)
        archive_only: Only run archive job (monthly)
    """
    logger = PipelineLogger()
    logger.log("PIPELINE", "Starting pipeline run", {"mode": "supplementary" if supplementary_only else ("archive" if archive_only else "full")})

    start_time = datetime.now(timezone.utc)
    stats = {
        "fetched": 0,
        "duplicates": 0,
        "blocked": 0,
        "false_claims": 0,
        "single_source": 0,
        "low_score": 0,
        "published": 0
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
            logger.log("ARCHIVE", f"Archived {deleted_count} old posts")
            return

        all_articles = []

        rss_fetcher = RSSFetcher()
        rss_articles = rss_fetcher.fetch_all()
        all_articles.extend(rss_articles)
        logger.log("FETCH", f"Fetched {len(rss_articles)} articles from RSS feeds")

        if supplementary_only:
            with ThreadPoolExecutor(max_workers=2) as executor:
                futures = {
                    executor.submit(GNewsFetcher().fetch): "GNews",
                    executor.submit(NewsAPIFetcher().fetch): "NewsAPI"
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

        new_articles = []
        for article in all_articles:
            if deduplicator.is_new(article):
                new_articles.append(article)
            else:
                stats["duplicates"] += 1

        deduplicator.batch_insert_new_articles(new_articles)

        logger.log("DEDUPLICATE", f"{len(new_articles)} new articles after deduplication")

        unblocked_articles = []
        for article in new_articles:
            if is_blocked_domain(article.get("source_url", "")):
                deduplicator.log_discarded(article, "blocked_domain")
                stats["blocked"] += 1
            else:
                unblocked_articles.append(article)

        logger.log("BLOCK_CHECK", f"{len(unblocked_articles)} articles after domain filtering")

        clean_articles = []
        for article in unblocked_articles:
            if factcheck_matcher.is_false_claim(article.get("headline", "")):
                deduplicator.log_discarded(article, "known_false_claim")
                stats["false_claims"] += 1
            else:
                clean_articles.append(article)

        logger.log("FACT_CHECK", f"{len(clean_articles)} articles after fact-check filtering")

        verified_groups = cross_source_checker.get_verified_groups(clean_articles)
        articles_in_groups = sum(len(g) for g in verified_groups)
        stats["single_source"] = len(clean_articles) - articles_in_groups

        logger.log("CROSS_SOURCE", f"{len(verified_groups)} article groups with 2+ sources")

        for group in verified_groups:
            try:
                verification = groq_verifier.verify(group)

                score = verification.get("score", 0)
                if score < 65:
                    deduplicator.log_discarded_group(group, "low_credibility_score", score)
                    stats["low_score"] += 1
                    continue

                writing = groq_writer.write(
                    key_facts=verification["key_facts"],
                    category=verification["category"]
                )

                post = post_builder.build(
                    headline=writing["headline"],
                    summary=writing["summary"],
                    category=verification["category"],
                    credibility_score=score,
                    credibility_reason=verification["reason"],
                    source_articles=group
                )

                publisher.publish(post)
                stats["published"] += 1

                deduplicator.mark_group_processed(group)

            except Exception as e:
                logger.log("ERROR", f"Failed to process article group: {str(e)}")
                logger.log("ERROR", traceback.format_exc())
                continue

        duration = (datetime.now(timezone.utc) - start_time).total_seconds()
        logger.log("COMPLETE", f"Pipeline completed in {duration:.1f}s", stats)

    except Exception as e:
        logger.log("ERROR", f"Pipeline failed: {str(e)}")
        logger.log("ERROR", traceback.format_exc())
        raise
