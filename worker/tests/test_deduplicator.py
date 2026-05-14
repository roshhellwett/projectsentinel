"""
Regression tests for the deduplicator's stale-singleton sweep.

The sweep is the bookend to a pipeline-orchestration change that stops
killing every unverified single-source article at the end of each tick.
Without the sweep, the unprocessed pool grows unbounded; without the
buffering, breaking news never gets verified because the second source
arrives after the first has already been marked processed.

These tests lock in the contract:
  1. `hours <= 0` is a no-op (defensive: avoid sweeping the entire pool).
  2. A missing Supabase client is a no-op (returns 0).
  3. The query filters on `processed=False` AND `fetched_at < cutoff`.
  4. Exceptions are caught and surface as `0`, not a pipeline crash.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock, patch

from fetcher.deduplicator import Deduplicator


def _make_dedup_with_mock_supabase() -> tuple[Deduplicator, MagicMock]:
    """Build a Deduplicator whose Supabase client is a fully-controlled mock.

    Returns the deduplicator and the underlying chain-end execute() mock so
    tests can assert the SQL builder was called with the expected filters.
    """
    with patch("fetcher.deduplicator.get_supabase") as mock_get:
        mock_sb = MagicMock()
        mock_get.return_value = mock_sb
        dedup = Deduplicator()
    # Convenience: every call chain ends with .execute() returning a MagicMock
    # whose .data is configurable per-test.
    return dedup, mock_sb


def test_sweep_with_zero_hours_is_noop():
    """`hours <= 0` must short-circuit before touching Supabase."""
    dedup, mock_sb = _make_dedup_with_mock_supabase()
    assert dedup.sweep_stale_unprocessed(hours=0) == 0
    mock_sb.table.assert_not_called()


def test_sweep_without_supabase_is_noop():
    """A deduplicator that never got a Supabase client must return 0 cleanly."""
    with patch("fetcher.deduplicator.get_supabase", return_value=None):
        dedup = Deduplicator()
    assert dedup.sweep_stale_unprocessed(hours=4) == 0


def test_sweep_filters_on_processed_false_and_age_cutoff():
    """The UPDATE must scope to unprocessed AND older-than-cutoff rows.

    A bug in the filter chain would either (a) sweep brand-new singletons,
    breaking the buffering invariant the pipeline relies on, or (b) sweep
    already-processed rows, doing extra DB write work for no reason.
    """
    dedup, mock_sb = _make_dedup_with_mock_supabase()

    fake_swept_rows = [{"url_hash": "a"}, {"url_hash": "b"}, {"url_hash": "c"}]
    mock_sb.table.return_value.update.return_value.eq.return_value.lt.return_value.execute.return_value = MagicMock(
        data=fake_swept_rows
    )

    before = datetime.now(UTC)
    swept = dedup.sweep_stale_unprocessed(hours=4)
    after = datetime.now(UTC)

    assert swept == len(fake_swept_rows)

    # Verify the filter chain: table → update → eq("processed", False) → lt("fetched_at", cutoff)
    mock_sb.table.assert_called_once_with("raw_articles")
    mock_sb.table.return_value.update.assert_called_once_with({"processed": True})
    mock_sb.table.return_value.update.return_value.eq.assert_called_once_with("processed", False)

    lt_args = mock_sb.table.return_value.update.return_value.eq.return_value.lt.call_args
    assert lt_args.args[0] == "fetched_at"

    # The cutoff must be ~4h before "now" (within wall-clock tolerance for
    # the time elapsed inside the call). Tighter than 1s would be flaky on
    # a busy CI runner; looser than 5s would let real bugs through.
    cutoff_str = lt_args.args[1]
    cutoff = datetime.fromisoformat(cutoff_str)
    expected_min = before - timedelta(hours=4, seconds=5)
    expected_max = after - timedelta(hours=4)
    assert expected_min <= cutoff <= expected_max, (
        f"cutoff {cutoff} not in expected window [{expected_min}, {expected_max}]"
    )


def test_sweep_returns_zero_on_supabase_exception():
    """A Supabase failure must not crash the pipeline — the sweep is best-effort."""
    dedup, mock_sb = _make_dedup_with_mock_supabase()
    mock_sb.table.return_value.update.return_value.eq.return_value.lt.return_value.execute.side_effect = Exception(
        "connection reset"
    )

    # Must not raise, must return 0.
    swept = dedup.sweep_stale_unprocessed(hours=4)
    assert swept == 0


def test_sweep_returns_zero_when_response_payload_is_empty():
    """Some Supabase configs return None or an empty list for `.data` after
    an UPDATE. The sweep must treat that as 'nothing to report' (0), not a
    crash, since the UPDATE itself still succeeds."""
    dedup, mock_sb = _make_dedup_with_mock_supabase()
    mock_sb.table.return_value.update.return_value.eq.return_value.lt.return_value.execute.return_value = MagicMock(
        data=None
    )

    assert dedup.sweep_stale_unprocessed(hours=4) == 0
