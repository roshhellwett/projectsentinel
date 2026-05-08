"""
Structured logging for the pipeline.
Logs to stdout so Railway captures everything.
"""

import json
from datetime import UTC, datetime
from typing import Any


class PipelineLogger:
    """Structured JSON logger for pipeline events."""

    def log(self, event: str, message: str, data: dict[str, Any] | None = None) -> None:
        """
        Log a structured event to stdout.

        Args:
            event: Event type (e.g., "FETCH", "VERIFY", "PUBLISH")
            message: Human-readable message
            data: Optional dictionary of additional data
        """
        log_entry = {"timestamp": datetime.now(UTC).isoformat(), "event": event, "message": message}

        if data:
            log_entry["data"] = data

        # Output as JSON for structured logging
        print(json.dumps(log_entry, ensure_ascii=False))
