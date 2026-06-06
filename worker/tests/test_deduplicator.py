
from __future__ import annotations

from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock, patch

from fetcher.deduplicator import Deduplicator

def _make_dedup_with_mock_supabase() -> tuple[Deduplicator, MagicMock]:
    with patch("fetcher.deduplicator.get_supabase") as mock_get:
        mock_sb = MagicMock()
        mock_get.return_value = mock_sb
        dedup = Deduplicator()
    return dedup, mock_sb

def test_sweep_with_zero_hours_is_noop():
    dedup, mock_sb = _make_dedup_with_mock_supabase()
    assert dedup.sweep_stale_unprocessed(hours=0) == 0
    mock_sb.table.assert_not_called()

def test_sweep_without_supabase_is_noop():
    with patch("fetcher.deduplicator.get_supabase", return_value=None):
        dedup = Deduplicator()
    assert dedup.sweep_stale_unprocessed(hours=4) == 0

def test_sweep_filters_on_processed_false_and_age_cutoff():
    dedup, mock_sb = _make_dedup_with_mock_supabase()

    fake_swept_rows = [{"url_hash": "a"}, {"url_hash": "b"}, {"url_hash": "c"}]
    mock_sb.table.return_value.update.return_value.eq.return_value.lt.return_value.execute.return_value = MagicMock(
        data=fake_swept_rows
    )

    before = datetime.now(UTC)
    swept = dedup.sweep_stale_unprocessed(hours=4)
    after = datetime.now(UTC)

    assert swept == len(fake_swept_rows)

    mock_sb.table.assert_called_once_with("raw_articles")
    mock_sb.table.return_value.update.assert_called_once_with({"processed": True})
    mock_sb.table.return_value.update.return_value.eq.assert_called_once_with("processed", False)

    lt_args = mock_sb.table.return_value.update.return_value.eq.return_value.lt.call_args
    assert lt_args.args[0] == "fetched_at"

    cutoff_str = lt_args.args[1]
    cutoff = datetime.fromisoformat(cutoff_str)
    expected_min = before - timedelta(hours=4, seconds=5)
    expected_max = after - timedelta(hours=4)
    assert expected_min <= cutoff <= expected_max, (
        f"cutoff {cutoff} not in expected window [{expected_min}, {expected_max}]"
    )

def test_sweep_returns_zero_on_supabase_exception():
    dedup, mock_sb = _make_dedup_with_mock_supabase()
    mock_sb.table.return_value.update.return_value.eq.return_value.lt.return_value.execute.side_effect = Exception(
        "connection reset"
    )

    swept = dedup.sweep_stale_unprocessed(hours=4)
    assert swept == 0

def test_sweep_returns_zero_when_response_payload_is_empty():
    dedup, mock_sb = _make_dedup_with_mock_supabase()
    mock_sb.table.return_value.update.return_value.eq.return_value.lt.return_value.execute.return_value = MagicMock(
        data=None
    )

    assert dedup.sweep_stale_unprocessed(hours=4) == 0
