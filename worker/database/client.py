"""
Shared Supabase client singleton to prevent excessive connections.
"""

import os
import threading

from supabase import Client, create_client

from logger.pipeline_logger import PipelineLogger

_client_instance: Client | None = None
_client_lock = threading.Lock()


def get_supabase() -> Client | None:
    """Get or create the shared Supabase client."""
    global _client_instance
    if _client_instance is not None:
        return _client_instance

    with _client_lock:
        if _client_instance is not None:
            return _client_instance

        supabase_url = os.getenv("SUPABASE_URL", "")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

        if supabase_url and supabase_key:
            try:
                _client_instance = create_client(supabase_url, supabase_key)
                PipelineLogger().log("SUPABASE", "Shared client initialized")
                return _client_instance
            except Exception as e:
                PipelineLogger().log("SUPABASE_ERROR", f"Failed to initialize client: {str(e)}")
        else:
            PipelineLogger().log("SUPABASE_ERROR", "Credentials not configured")

        return None
