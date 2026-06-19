

import json
from datetime import UTC, datetime
from typing import Any


class PipelineLogger:

    def log(self, event: str, message: str, data: dict[str, Any] | None = None) -> None:

        log_entry = {"timestamp": datetime.now(UTC).isoformat(), "event": event, "message": message}

        if data:
            log_entry["data"] = data

        print(json.dumps(log_entry, ensure_ascii=False))
