import contextlib
import time
from threading import Barrier, BrokenBarrierError, Thread
from unittest.mock import MagicMock, patch

from cache.shared_cache import SharedCache


class TestCacheConcurrency:
    def test_100_threads_contended_get_set(self):
        c = SharedCache()
        c.register("hot", 120)
        c.set("hot", 0)
        barrier = Barrier(100)
        errors = []

        def worker():
            with contextlib.suppress(BrokenBarrierError):
                barrier.wait()
            for _ in range(200):
                c.set("hot", 1)
                v = c.get("hot")
                if v is not None:
                    c.set("hot", v)

        threads = [Thread(target=worker) for _ in range(100)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert not errors

    def test_50_threads_add_to_set(self):
        c = SharedCache()
        c.register("bigset", 120)
        c.set("bigset", set())
        threads = []
        for batch in range(10):
            start = batch * 100
            for i in range(start, start + 100):
                t = Thread(target=lambda i=i: c.add_to_set("bigset", i))
                threads.append(t)
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        assert len(c.get("bigset")) == 1000

    def test_20_threads_register_and_set_different_keys(self):
        c = SharedCache()
        threads = []
        for i in range(20):
            t = Thread(
                target=lambda i=i: (
                    c.register(f"key_{i}", 60),
                    c.set(f"key_{i}", i),
                )
            )
            threads.append(t)
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        for i in range(20):
            assert c.get(f"key_{i}") == i

    def test_age_seconds_under_concurrent_set(self):
        c = SharedCache()
        c.register("age", 60)
        barrier = Barrier(20)

        def writer():
            barrier.wait()
            for _ in range(50):
                c.set("age", 1)

        threads = [Thread(target=writer) for _ in range(20)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        age = c._age_seconds("age")
        assert age is not None
        assert 0 <= age < 10

    def test_stale_or_none_while_concurrent_set(self):
        c = SharedCache()
        c.register("stale_race", 60)
        c.set("stale_race", "initial")
        barrier = Barrier(20)

        def worker():
            barrier.wait()
            for _ in range(100):
                v = c.stale_or_none("stale_race")
                assert v == "initial"

        threads = [Thread(target=worker) for _ in range(20)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

    def test_rapid_successive_get_set_no_sleep(self):
        c = SharedCache()
        c.register("rapid", 60)
        for _ in range(5000):
            c.set("rapid", 1)
            assert c.get("rapid") == 1

    def test_1000_key_registrations(self):
        c = SharedCache()
        for i in range(1000):
            c.register(f"mass_{i}", 60)
        for i in range(1000):
            c.set(f"mass_{i}", i)
        for i in range(1000):
            assert c.get(f"mass_{i}") == i


class TestCacheStaleFallback:
    def test_stale_returned_on_db_failure(self):
        from cache.keys import KNOWN_HASHES, KNOWN_HASHES_TTL
        from cache.shared_cache import cache as global_cache
        from fetcher.deduplicator import Deduplicator

        global_cache.reset_state()
        global_cache.register(KNOWN_HASHES, KNOWN_HASHES_TTL)

        with patch("fetcher.deduplicator.get_supabase") as mock_get:
            mock_sb_fail = MagicMock()
            mock_sb_fail.table.return_value.select.return_value.gte.return_value.order.return_value.range.side_effect = Exception(
                "db timeout"
            )
            mock_get.return_value = mock_sb_fail
            dedup = Deduplicator()
            result = dedup._load_known_hashes()
            assert result == set()

        with patch("fetcher.deduplicator.get_supabase") as mock_get:
            mock_sb_ok = MagicMock()
            mock_sb_ok.table.return_value.select.return_value.gte.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(
                data=[{"url_hash": "h1"}]
            )
            mock_get.return_value = mock_sb_ok
            dedup2 = Deduplicator()
            global_cache.reset_state()
            global_cache.register(KNOWN_HASHES, KNOWN_HASHES_TTL)
            result2 = dedup2._load_known_hashes()
            assert "h1" in result2

        with patch("fetcher.deduplicator.get_supabase") as mock_get:
            mock_sb_fail2 = MagicMock()
            mock_sb_fail2.table.return_value.select.return_value.gte.return_value.order.return_value.range.side_effect = Exception(
                "db timeout again"
            )
            mock_get.return_value = mock_sb_fail2
            dedup3 = Deduplicator()
            result3 = dedup3._load_known_hashes()
            assert "h1" in result3

    def test_empty_on_first_db_failure_no_stale(self):
        from cache.keys import KNOWN_HASHES, KNOWN_HASHES_TTL
        from cache.shared_cache import cache as global_cache
        from fetcher.deduplicator import Deduplicator

        global_cache.reset_state()
        global_cache.register(KNOWN_HASHES, KNOWN_HASHES_TTL)

        with patch("fetcher.deduplicator.get_supabase") as mock_get:
            mock_sb = MagicMock()
            mock_sb.table.return_value.select.return_value.gte.return_value.order.return_value.range.side_effect = (
                Exception("initial failure")
            )
            mock_get.return_value = mock_sb
            dedup = Deduplicator()
            result = dedup._load_known_hashes()
            assert result == set()

    def test_publisher_stale_on_db_error(self):
        from cache.keys import PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL
        from cache.shared_cache import cache as global_cache
        from publisher.supabase_publisher import SupabasePublisher

        global_cache.reset_state()
        global_cache.register(PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL)

        global_cache.set(PUBLISH_HEADLINES, ["Stale Headline"])

        with patch("publisher.supabase_publisher.get_supabase") as mock_get:
            mock_sb = MagicMock()
            mock_sb.table.return_value.select.return_value.order.return_value.limit.return_value.execute.side_effect = (
                Exception("db error")
            )
            mock_get.return_value = mock_sb
            pub = SupabasePublisher()
            headlines = pub._get_recent_headlines()
            assert "Stale Headline" in headlines


class TestCacheIsolation:
    def test_different_keys_dont_interfere(self):
        c = SharedCache()
        c.register("a", 60)
        c.register("b", 60)
        c.set("a", 100)
        c.set("b", 200)
        assert c.get("a") == 100
        assert c.get("b") == 200

    def test_set_one_key_does_not_affect_others(self):
        c = SharedCache()
        keys = [f"k{i}" for i in range(100)]
        for k in keys:
            c.register(k, 60)
        for i, k in enumerate(keys):
            c.set(k, i)
        c.set("k0", 9999)
        for i, k in enumerate(keys[1:], 1):
            assert c.get(k) == i

    def test_add_to_set_isolation(self):
        c = SharedCache()
        c.register("s1", 60)
        c.register("s2", 60)
        c.set("s1", {1, 2})
        c.set("s2", {3, 4})
        c.add_to_set("s1", 99)
        assert c.get("s1") == {1, 2, 99}
        assert c.get("s2") == {3, 4}


class TestCacheEdgeCases:
    def test_set_none_value(self):
        c = SharedCache()
        c.register("none_val", 60)
        c.set("none_val", None)
        assert c.get("none_val") is None

    def test_set_large_set(self):
        c = SharedCache()
        c.register("large", 60)
        big = set(range(10000))
        c.set("large", big)
        assert len(c.get("large")) == 10000

    def test_fresh_copy_of_large_set(self):
        c = SharedCache()
        c.register("large_fc", 60)
        big = set(range(10000))
        c.set("large_fc", big)
        cp = c.fresh_copy("large_fc")
        assert len(cp) == 10000
        cp.add(99999)
        assert 99999 not in c.get("large_fc")

    def test_register_after_set_does_not_overwrite(self):
        c = SharedCache()
        c.register("existing_data", 60)
        c.set("existing_data", "original")
        c.register("existing_data", 120)
        assert c.get("existing_data") == "original"


class TestPipelinerapidCalls:
    def test_rapid_is_new_calls(self):
        from cache.keys import KNOWN_HASHES, KNOWN_HASHES_TTL
        from cache.shared_cache import cache as global_cache
        from fetcher.deduplicator import Deduplicator

        global_cache.reset_state()
        global_cache.register(KNOWN_HASHES, KNOWN_HASHES_TTL)

        with patch("fetcher.deduplicator.get_supabase") as mock_get:
            mock_sb = MagicMock()
            mock_sb.table.return_value.select.return_value.gte.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(
                data=[{"url_hash": f"existing_{i}"} for i in range(100)]
            )
            mock_get.return_value = mock_sb
            dedup = Deduplicator()

            articles = [
                {"url_hash": f"existing_{i}", "url": f"https://a.com/{i}", "headline": "Test"} for i in range(100)
            ]
            articles += [{"url_hash": f"new_{i}", "url": f"https://b.com/{i}", "headline": "Test"} for i in range(100)]

            start = time.time()
            results = [dedup.is_new(a) for a in articles]
            elapsed = time.time() - start

            assert sum(results) == 100
            assert elapsed < 2

    def test_rapid_publish_calls(self):
        from cache.keys import PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL
        from cache.shared_cache import cache as global_cache
        from publisher.supabase_publisher import SupabasePublisher

        global_cache.reset_state()
        global_cache.register(PUBLISH_HEADLINES, PUBLISH_HEADLINES_TTL)

        with patch("publisher.supabase_publisher.get_supabase") as mock_get:
            mock_sb = MagicMock()
            mock_sb.table.return_value.select.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(
                data=[]
            )
            mock_sb.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
            mock_get.return_value = mock_sb
            pub = SupabasePublisher()

            headlines = [
                "Stock market hits all time high",
                "Earthquake reported off coast of Japan",
                "Scientists discover new species in deep ocean",
                "Government announces new infrastructure plan",
                "World Cup final draws record viewership",
                "Tech company launches revolutionary AI product",
                "Severe weather warning issued for northern states",
                "Historic peace treaty signed in Geneva",
                "Breakthrough in cancer research announced",
                "Major earthquake hits Pacific region",
            ]
            posts = [
                {
                    "headline": h,
                    "summary": "Test",
                    "category": "world",
                    "credibility_score": 80,
                    "credibility_reason": "good",
                    "sources": [{"url": f"https://a.com/{i}"}],
                }
                for i, h in enumerate(headlines)
            ]

            start = time.time()
            results = [pub.publish(p) for p in posts]
            elapsed = time.time() - start

            assert sum(results) == len(posts)
            assert elapsed < 3


class TestPipelineRapidRuns:
    def test_10_rapid_pipeline_runs(self):
        from cache.shared_cache import cache as global_cache
        from scheduler.jobs import _pipeline_running, run_pipeline

        for run_num in range(10):
            global_cache.reset_state()
            _pipeline_running.clear()

            with (
                patch("scheduler.jobs._record_run_start", return_value=f"rapid_run{run_num}"),
                patch("scheduler.jobs._record_run_end"),
                patch("scheduler.jobs.GroqVerifier.save_pool_stats"),
                patch("scheduler.jobs._budgeted_groups_per_run", return_value=3),
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
                        "url_hash": f"h{i}_{run_num}",
                        "url": f"https://a.com/{i}",
                        "headline": f"Headline {i} run {run_num}",
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
                            "url_hash": f"g{r}0",
                            "url": f"https://g{r}0.com",
                            "headline": f"Group {r} run {run_num}",
                            "source_name": f"Src{r}",
                            "source_url": f"https://src{r}.com",
                        }
                    ]
                    for r in range(2)
                ]
                mock_csc_cls.return_value = mock_csc

                mock_gv = MagicMock()
                mock_gv.verify.return_value = {
                    "score": 80,
                    "headline": f"Generated Headline {run_num}",
                    "summary": "A summary",
                    "key_facts": [],
                    "category": "world",
                    "reason": "good score",
                }
                mock_gv_cls.return_value = mock_gv

                mock_sb = MagicMock()
                mock_get_sb.return_value = mock_sb

                start = time.time()
                run_pipeline()
                elapsed = time.time() - start

                assert elapsed < 5
                mock_rss.close.assert_called_once()

    def test_concurrent_main_and_supplementary(self):
        from cache.shared_cache import cache as global_cache
        from scheduler.jobs import _pipeline_running, run_pipeline

        _pipeline_running.clear()

        def run_main():
            global_cache.reset_state()
            with (
                patch("scheduler.jobs._record_run_start", return_value="concurrent_main"),
                patch("scheduler.jobs._record_run_end"),
                patch("scheduler.jobs.GroqVerifier.save_pool_stats"),
                patch("scheduler.jobs._budgeted_groups_per_run", return_value=2),
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
                mock_rss.fetch_all.return_value = []
                mock_rss_cls.return_value = mock_rss

                mock_csc = MagicMock()
                mock_csc.get_verified_groups.return_value = []
                mock_csc_cls.return_value = mock_csc

                mock_sb = MagicMock()
                mock_get_sb.return_value = mock_sb

                run_pipeline()

        def run_supplementary():
            with (
                patch("scheduler.jobs._record_run_start", return_value="concurrent_supp"),
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
                mock_gn.fetch.return_value = []
                mock_gn_cls.has_quota.return_value = True
                mock_gn_cls.return_value = mock_gn

                mock_na = MagicMock()
                mock_na.fetch.return_value = []
                mock_na_cls.has_quota.return_value = False
                mock_na_cls.return_value = mock_na

                mock_sb = MagicMock()
                mock_get_sb.return_value = mock_sb

                run_pipeline(supplementary_only=True)

        main_thread = Thread(target=run_main)
        supp_thread = Thread(target=run_supplementary)

        start = time.time()
        main_thread.start()
        supp_thread.start()
        main_thread.join(timeout=15)
        supp_thread.join(timeout=15)
        elapsed = time.time() - start

        assert elapsed < 20
        assert not main_thread.is_alive()
        assert not supp_thread.is_alive()
