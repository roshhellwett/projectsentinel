"""Shared rate limiter for external API calls."""

import time
from threading import Lock


class RateLimitExceededError(Exception):
    """Raised when a rate limiter's daily call budget is exhausted."""


class RateLimiter:
    """Manages process-wide rate limiting for API calls."""

    _instances: dict[str, "RateLimiter"] = {}
    _instances_lock = Lock()

    @classmethod
    def get_global(
        cls,
        name: str,
        min_delay_seconds: float,
        max_calls_per_day: int | None = None,
    ) -> "RateLimiter":
        """Return a named singleton limiter shared across modules."""
        with cls._instances_lock:
            if name not in cls._instances:
                cls._instances[name] = cls(min_delay_seconds, max_calls_per_day)
            return cls._instances[name]

    def __init__(
        self,
        min_delay_seconds: float = 6.0,
        max_calls_per_day: int | None = None,
    ):
        self.min_delay = min_delay_seconds
        self.max_calls_per_day = max_calls_per_day
        self.last_call_time = 0.0
        self.calls_today = 0
        self.day_start = time.time()
        self._lock = Lock()

    def wait_if_needed(self):
        """Wait if needed to respect rate limits."""
        with self._lock:
            current_time = time.time()

            if current_time - self.day_start >= 86400:
                self.calls_today = 0
                self.day_start = current_time

            if self.max_calls_per_day and self.calls_today >= self.max_calls_per_day:
                raise RateLimitExceededError(f"Daily limit reached: {self.max_calls_per_day} calls")

            time_since_last = current_time - self.last_call_time
            if time_since_last < self.min_delay:
                time.sleep(self.min_delay - time_since_last)

            self.last_call_time = time.time()
            self.calls_today += 1

    def get_calls_remaining(self) -> int | None:
        """Get remaining calls for today."""
        if not self.max_calls_per_day:
            return None
        return max(0, self.max_calls_per_day - self.calls_today)
