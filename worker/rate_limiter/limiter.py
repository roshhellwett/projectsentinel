class RateLimitExceededError(Exception):
    """Raised when a rate limiter's daily call budget is exhausted."""
