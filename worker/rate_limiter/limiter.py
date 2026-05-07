"""
Rate limiter - enforces delays between API calls to respect free tier limits.
"""

import time
from typing import Optional


class RateLimiter:
    """Manages rate limiting for API calls."""
    
    def __init__(
        self,
        min_delay_seconds: float = 4.0,  # Gemini: 15 req/min max
        max_calls_per_day: Optional[int] = None
    ):
        self.min_delay = min_delay_seconds
        self.max_calls_per_day = max_calls_per_day
        self.last_call_time = 0
        self.calls_today = 0
        self.day_start = time.time()
    
    def wait_if_needed(self):
        """Wait if needed to respect rate limits."""
        current_time = time.time()
        
        # Reset daily counter if day has passed
        if current_time - self.day_start >= 86400:  # 24 hours
            self.calls_today = 0
            self.day_start = current_time
        
        # Check daily limit
        if self.max_calls_per_day and self.calls_today >= self.max_calls_per_day:
            raise Exception(f"Daily limit reached: {self.max_calls_per_day} calls")
        
        # Apply delay
        time_since_last = current_time - self.last_call_time
        if time_since_last < self.min_delay:
            sleep_time = self.min_delay - time_since_last
            time.sleep(sleep_time)
        
        self.last_call_time = time.time()
        self.calls_today += 1
    
    def get_calls_remaining(self) -> Optional[int]:
        """Get remaining calls for today."""
        if not self.max_calls_per_day:
            return None
        return self.max_calls_per_day - self.calls_today
