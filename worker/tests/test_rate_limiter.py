from rate_limiter.limiter import RateLimitExceededError


def test_rate_limit_exceeded_error_is_exception():
    assert issubclass(RateLimitExceededError, Exception)


def test_rate_limit_exceeded_error_can_be_raised():
    try:
        raise RateLimitExceededError("budget exhausted")
    except RateLimitExceededError as e:
        assert str(e) == "budget exhausted"


def test_rate_limiter_class_removed():
    import sys

    mod = sys.modules.get("rate_limiter.limiter")
    assert mod is not None
    assert not hasattr(mod, "RateLimiter")
