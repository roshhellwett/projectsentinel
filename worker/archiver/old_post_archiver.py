"""
Archives old posts - deletes posts older than 6 months (runs monthly).
"""

import os
from datetime import datetime, timedelta

from supabase import create_client

from logger.pipeline_logger import PipelineLogger


class OldPostArchiver:
    """Archives posts older than 6 months."""
    
    def __init__(self):
        self.logger = PipelineLogger()
        self.supabase = None
        self._init_supabase()
    
    def _init_supabase(self):
        """Initialize Supabase client."""
        supabase_url = os.getenv("SUPABASE_URL", "")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        
        if supabase_url and supabase_key:
            try:
                self.supabase = create_client(supabase_url, supabase_key)
            except Exception as e:
                self.logger.log("ARCHIVER_ERROR", f"Failed to connect: {str(e)}")
    
    def archive_old_posts(self) -> int:
        """
        Delete posts older than 6 months.
        
        Returns:
            Number of posts deleted
        """
        if not self.supabase:
            self.logger.log("ARCHIVER_ERROR", "Supabase not initialized")
            return 0
        
        try:
            # Calculate cutoff date (6 months ago)
            cutoff_date = (datetime.utcnow() - timedelta(days=180)).isoformat()
            
            # Get count of old posts
            count_result = self.supabase.table("posts")\
                .select("id", count="exact")\
                .lt("published_at", cutoff_date)\
                .execute()
            
            old_count = count_result.count if hasattr(count_result, 'count') else 0
            
            if old_count == 0:
                self.logger.log("ARCHIVER", "No old posts to archive")
                return 0
            
            # Delete old posts
            delete_result = self.supabase.table("posts")\
                .delete()\
                .lt("published_at", cutoff_date)\
                .execute()
            
            deleted = len(delete_result.data) if delete_result.data else 0
            self.logger.log("ARCHIVER", f"Archived {deleted} posts older than 6 months")
            
            return deleted
            
        except Exception as e:
            self.logger.log("ARCHIVER_ERROR", f"Failed to archive: {str(e)}")
            return 0
