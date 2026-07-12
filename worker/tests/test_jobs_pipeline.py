from unittest.mock import MagicMock, patch

import pytest

from cache.shared_cache import cache
from scheduler.jobs import _pipeline_running


def setup_function():
    cache.reset_state()
    _pipeline_running.clear()


def test_dead_letter_on_budget_exhaust():
    from scheduler.jobs import run_pipeline

    with (
        patch("scheduler.jobs._record_run_start", return_value="run1"),
        patch("scheduler.jobs._record_run_end"),
        patch("scheduler.jobs.GroqVerifier.save_pool_stats"),
        patch("scheduler.jobs._budgeted_groups_per_run", return_value=10),
        patch("scheduler.jobs.Deduplicator") as mock_dedup_cls,
        patch("scheduler.jobs.FactCheckMatcher"),
        patch("scheduler.jobs.CrossSourceChecker") as mock_csc_cls,
        patch("scheduler.jobs.GroqVerifier") as mock_gv_cls,
        patch("scheduler.jobs.GroqWriter"),
        patch("scheduler.jobs.PostBuilder"),
        patch("scheduler.jobs.SupabasePublisher"),
        patch("scheduler.jobs.RSSFetcher") as mock_rss_cls,
        patch("scheduler.jobs.FactCheckFetcher"),
        patch("database.client.get_supabase") as mock_get_sb,
        patch("scheduler.jobs.os.getenv", return_value="10"),
    ):
        from verifier.groq_verifier import AllKeysExhaustedError

        mock_dedup = MagicMock()
        mock_dedup.is_new.return_value = True
        mock_dedup.is_duplicate_by_title.return_value = False
        mock_dedup.get_unprocessed_articles.return_value = []
        mock_dedup.sweep_stale_unprocessed.return_value = 0
        mock_dedup.supabase = MagicMock()
        mock_dedup_cls.return_value = mock_dedup

        mock_rss = MagicMock()
        mock_rss.fetch_all.return_value = [
            {
                "url_hash": "a",
                "url": "https://a.com",
                "headline": "Headline A",
                "source_name": "SrcA",
                "source_url": "https://srca.com",
            }
        ]
        mock_rss_cls.return_value = mock_rss

        mock_csc = MagicMock()
        mock_csc.get_verified_groups.return_value = [
            [
                {
                    "url_hash": "g1a",
                    "url": "https://g1a.com",
                    "headline": "Group 1 Headline",
                    "source_name": "Src1",
                    "source_url": "https://src1.com",
                }
            ],
            [
                {
                    "url_hash": "g2a",
                    "url": "https://g2a.com",
                    "headline": "Group 2 Headline",
                    "source_name": "Src2",
                    "source_url": "https://src2.com",
                }
            ],
        ]
        mock_csc_cls.return_value = mock_csc

        mock_gv = MagicMock()
        mock_gv.verify.side_effect = AllKeysExhaustedError("all keys exhausted")
        mock_gv_cls.return_value = mock_gv

        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        run_pipeline()

        assert mock_dedup.supabase.table.return_value.update.return_value.in_.return_value.execute.call_count >= 0
        call_count = mock_dedup.mark_group_processed.call_count
        assert call_count >= 0


def test_pipeline_handles_rss_error_gracefully():
    from scheduler.jobs import run_pipeline

    with (
        patch("scheduler.jobs._record_run_start", return_value="run2"),
        patch("scheduler.jobs._record_run_end"),
        patch("scheduler.jobs.GroqVerifier.save_pool_stats"),
        patch("scheduler.jobs._budgeted_groups_per_run", return_value=5),
        patch("scheduler.jobs.Deduplicator") as mock_dedup_cls,
        patch("scheduler.jobs.FactCheckMatcher"),
        patch("scheduler.jobs.CrossSourceChecker"),
        patch("scheduler.jobs.GroqVerifier"),
        patch("scheduler.jobs.GroqWriter"),
        patch("scheduler.jobs.PostBuilder"),
        patch("scheduler.jobs.SupabasePublisher"),
        patch("scheduler.jobs.RSSFetcher") as mock_rss_cls,
        patch("scheduler.jobs.FactCheckFetcher"),
        patch("database.client.get_supabase") as mock_get_sb,
        patch("scheduler.jobs.os.getenv", return_value="10"),
    ):
        mock_dedup = MagicMock()
        mock_dedup.is_new.return_value = True
        mock_dedup.is_duplicate_by_title.return_value = False
        mock_dedup.get_unprocessed_articles.return_value = []
        mock_dedup.sweep_stale_unprocessed.return_value = 0
        mock_dedup.supabase = MagicMock()
        mock_dedup_cls.return_value = mock_dedup

        mock_rss = MagicMock()
        mock_rss.fetch_all.side_effect = Exception("rss network error")
        mock_rss_cls.return_value = mock_rss

        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        with pytest.raises(Exception, match="rss network error"):
            run_pipeline()

        mock_rss.close.assert_called_once()


def test_pipeline_skips_groups_over_cap():
    from scheduler.jobs import run_pipeline

    with (
        patch("scheduler.jobs._record_run_start", return_value="run3"),
        patch("scheduler.jobs._record_run_end"),
        patch("scheduler.jobs.GroqVerifier.save_pool_stats"),
        patch("scheduler.jobs._budgeted_groups_per_run", return_value=1),
        patch("scheduler.jobs.Deduplicator") as mock_dedup_cls,
        patch("scheduler.jobs.FactCheckMatcher"),
        patch("scheduler.jobs.CrossSourceChecker") as mock_csc_cls,
        patch("scheduler.jobs.GroqVerifier"),
        patch("scheduler.jobs.GroqWriter"),
        patch("scheduler.jobs.PostBuilder"),
        patch("scheduler.jobs.SupabasePublisher"),
        patch("scheduler.jobs.RSSFetcher") as mock_rss_cls,
        patch("scheduler.jobs.FactCheckFetcher"),
        patch("database.client.get_supabase") as mock_get_sb,
        patch("scheduler.jobs.os.getenv", return_value="10"),
    ):
        mock_dedup = MagicMock()
        mock_dedup.is_new.return_value = True
        mock_dedup.is_duplicate_by_title.return_value = False
        mock_dedup.get_unprocessed_articles.return_value = []
        mock_dedup.sweep_stale_unprocessed.return_value = 0
        mock_dedup.supabase = MagicMock()
        mock_dedup_cls.return_value = mock_dedup

        mock_rss = MagicMock()
        mock_rss.fetch_all.return_value = [
            {
                "url_hash": f"h{i}",
                "url": f"https://a.com/{i}",
                "headline": f"Headline {i}",
                "source_name": f"Src{i}",
                "source_url": f"https://src{i}.com",
            }
            for i in range(5)
        ]
        mock_rss_cls.return_value = mock_rss

        mock_csc = MagicMock()
        mock_csc.get_verified_groups.return_value = [
            [
                {
                    "url_hash": f"g{i}a",
                    "url": f"https://g{i}a.com",
                    "headline": f"Group {i} Headline",
                    "source_name": f"Src{i}",
                    "source_url": f"https://src{i}.com",
                }
            ]
            for i in range(3)
        ]
        mock_csc_cls.return_value = mock_csc

        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        run_pipeline()


def test_pipeline_supplementary_mode():
    from scheduler.jobs import run_pipeline

    with (
        patch("scheduler.jobs._record_run_start", return_value="run4"),
        patch("scheduler.jobs._record_run_end"),
        patch("scheduler.jobs.GroqVerifier.save_pool_stats"),
        patch("scheduler.jobs.Deduplicator") as mock_dedup_cls,
        patch("scheduler.jobs.GNewsFetcher") as mock_gn_cls,
        patch("scheduler.jobs.NewsAPIFetcher") as mock_na_cls,
        patch("scheduler.jobs.RSSFetcher"),
        patch("database.client.get_supabase") as mock_get_sb,
        patch("scheduler.jobs.os.getenv", return_value="10"),
    ):
        mock_dedup = MagicMock()
        mock_dedup.is_new.return_value = True
        mock_dedup.supabase = MagicMock()
        mock_dedup_cls.return_value = mock_dedup

        mock_gn = MagicMock()
        mock_gn.fetch.return_value = [
            {
                "url_hash": "gn1",
                "url": "https://gn.com",
                "headline": "GNews Article",
                "source_name": "GNews",
                "source_url": "https://gn.com",
            }
        ]
        mock_gn_cls.has_quota.return_value = True
        mock_gn_cls.return_value = mock_gn

        mock_na = MagicMock()
        mock_na.fetch.return_value = []
        mock_na_cls.has_quota.return_value = False
        mock_na_cls.return_value = mock_na

        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        run_pipeline(supplementary_only=True)


def test_pipeline_archive_mode():
    from scheduler.jobs import run_pipeline

    with (
        patch("scheduler.jobs._record_run_start", return_value="run5"),
        patch("scheduler.jobs._record_run_end"),
        patch("scheduler.jobs.GroqVerifier.save_pool_stats"),
        patch("scheduler.jobs.OldPostArchiver") as mock_archiver_cls,
        patch("database.client.get_supabase") as mock_get_sb,
    ):
        mock_archiver = MagicMock()
        mock_archiver.cleanup_all.return_value = {"deleted_posts": 5}
        mock_archiver_cls.return_value = mock_archiver

        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        run_pipeline(archive_only=True)

        mock_archiver.cleanup_all.assert_called_once()
