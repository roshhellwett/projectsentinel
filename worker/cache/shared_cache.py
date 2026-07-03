import threading
from datetime import UTC, datetime
from typing import Any


class SharedCache:
    """Thread-safe module-level cache that survives across pipeline runs.

    All caches use a single RLock so operations are serialized.
    On read error, the previous (stale) value is kept so the pipeline
    never operates with an empty cache (= duplicate flood risk).
    """

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._data: dict[str, Any] = {}
        self._loaded: dict[str, datetime | None] = {}
        self._ttl: dict[str, int] = {}

    def register(self, key: str, ttl_seconds: int) -> None:
        with self._lock:
            self._ttl[key] = ttl_seconds
            if key not in self._data:
                self._data[key] = None
                self._loaded[key] = None

    def get(self, key: str) -> Any:
        with self._lock:
            age = self._age_seconds(key)
            if age is not None and age < self._ttl.get(key, 0):
                return self._data.get(key)
            return None

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            self._data[key] = value
            self._loaded[key] = datetime.now(UTC)

    def stale_or_none(self, key: str) -> Any:
        """Return cached value even if expired, or None if never loaded."""
        with self._lock:
            return self._data.get(key)

    def fresh_copy(self, key: str) -> Any:
        """Return a deep-enough copy so callers don't mutate the cache."""
        val = self.get(key)
        if val is not None:
            if isinstance(val, set):
                return val.copy()
            if isinstance(val, list):
                return list(val)
        return val

    def add_to_set(self, key: str, item: Any) -> None:
        with self._lock:
            s = self._data.get(key)
            if isinstance(s, set):
                s.add(item)

    def add_to_list(self, key: str, item: Any) -> None:
        with self._lock:
            lst = self._data.get(key)
            if isinstance(lst, list):
                lst.append(item)

    def _age_seconds(self, key: str) -> float | None:
        loaded = self._loaded.get(key)
        if loaded is None:
            return None
        return (datetime.now(UTC) - loaded).total_seconds()

    @property
    def lock(self) -> threading.RLock:
        return self._lock

    def reset_state(self) -> None:
        """Clear cached data and loaded timestamps (keeps registrations)."""
        with self._lock:
            self._data.clear()
            self._loaded.clear()


# Singleton — imported by every module that needs caching
cache = SharedCache()
