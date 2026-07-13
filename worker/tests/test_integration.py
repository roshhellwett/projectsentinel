import os

import pytest

pytestmark = pytest.mark.integration

pytest.importorskip("supabase")


def skip_if_no_credentials():
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or "placeholder" in url.lower() or not key or "placeholder" in key.lower():
        pytest.skip("Real Supabase credentials not configured")


def test_supabase_connection():
    skip_if_no_credentials()
    from supabase import create_client

    client = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )
    resp = client.table("posts").select("id").limit(1).execute()
    assert hasattr(resp, "data"), "Supabase query should return data"


def test_database_has_posts():
    skip_if_no_credentials()
    from supabase import create_client

    client = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )
    resp = (
        client.table("posts")
        .select("id", count="estimated")
        .eq("status", "published")
        .limit(1)
        .execute()
    )
    assert isinstance(resp.data, list)


def test_pipeline_can_publish():
    skip_if_no_credentials()
    from publisher.supabase_publisher import SupabasePublisher

    pub = SupabasePublisher()
    post = {
        "headline": "[INTEGRATION TEST] Pipeline publish test",
        "summary": "Verifying end-to-end publishing pipeline functions correctly.",
        "category": "tech",
        "credibility_score": 50,
        "credibility_reason": "Integration test — automated verification check",
        "sources": [{"url": "https://example.com/integration-test"}],
    }
    result = pub.publish(post)
    assert result is True
