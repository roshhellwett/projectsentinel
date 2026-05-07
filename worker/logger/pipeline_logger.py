"""
Structured logging for the pipeline.
Logs to stdout so Railway captures everything.
"""

import json
from datetime import datetime
from typing import Any, Dict, Optional


class PipelineLogger:
    """Structured JSON logger for pipeline events."""
    
    def log(
        self,
        event: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Log a structured event to stdout.
        
        Args:
            event: Event type (e.g., "FETCH", "VERIFY", "PUBLISH")
            message: Human-readable message
            data: Optional dictionary of additional data
        """
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": event,
            "message": message
        }
        
        if data:
            log_entry["data"] = data
        
        # Output as JSON for structured logging
        print(json.dumps(log_entry, ensure_ascii=False))
