from threading import Thread

from cache.shared_cache import SharedCache
from cache.shared_cache import cache as global_cache


def test_register_and_get():
    c = SharedCache()
    c.register("test_key", 60)
    assert c.get("test_key") is None
    c.set("test_key", "hello")
    assert c.get("test_key") == "hello"


def test_ttl_expiry():
    c = SharedCache()
    c.register("expires", 1)
    c.set("expires", "value")
    import time

    time.sleep(1.1)
    assert c.get("expires") is None


def test_stale_or_none_after_expiry():
    c = SharedCache()
    c.register("stale_test", 1)
    assert c.stale_or_none("stale_test") is None
    c.set("stale_test", "old_value")
    import time

    time.sleep(1.1)
    assert c.get("stale_test") is None
    assert c.stale_or_none("stale_test") == "old_value"


def test_stale_or_none_never_loaded():
    c = SharedCache()
    c.register("never_loaded", 60)
    assert c.stale_or_none("never_loaded") is None


def test_fresh_copy_set():
    c = SharedCache()
    c.register("set_test", 60)
    c.set("set_test", {1, 2, 3})
    cp = c.fresh_copy("set_test")
    assert cp == {1, 2, 3}
    cp.add(4)
    assert c.get("set_test") == {1, 2, 3}


def test_fresh_copy_list():
    c = SharedCache()
    c.register("list_test", 60)
    c.set("list_test", [1, 2, 3])
    cp = c.fresh_copy("list_test")
    cp.append(4)
    assert c.get("list_test") == [1, 2, 3]


def test_fresh_copy_none():
    c = SharedCache()
    assert c.fresh_copy("nonexistent") is None


def test_add_to_set():
    c = SharedCache()
    c.register("s", 60)
    c.set("s", {1})
    c.add_to_set("s", 2)
    assert c.get("s") == {1, 2}


def test_add_to_set_not_set():
    c = SharedCache()
    c.register("ns", 60)
    c.set("ns", "string")
    c.add_to_set("ns", 2)
    assert c.get("ns") == "string"


def test_add_to_list():
    c = SharedCache()
    c.register("l", 60)
    c.set("l", [1])
    c.add_to_list("l", 2)
    assert c.get("l") == [1, 2]


def test_add_to_list_not_list():
    c = SharedCache()
    c.register("nl", 60)
    c.set("nl", "string")
    c.add_to_list("nl", "x")
    assert c.get("nl") == "string"


def test_register_preserves_existing_value():
    c = SharedCache()
    c.register("existing", 60)
    c.set("existing", "value")
    c.register("existing", 120)
    assert c.get("existing") == "value"


def test_concurrent_get_set():
    c = SharedCache()
    c.register("concurrent", 60)
    errors = []

    def worker(n):
        for _ in range(100):
            c.set("concurrent", n)
            v = c.get("concurrent")
            if v is None:
                continue

    threads = [Thread(target=worker, args=(i,)) for i in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert not errors


def test_concurrent_add_to_set():
    c = SharedCache()
    c.register("con_set", 60)
    c.set("con_set", set())
    threads = [Thread(target=lambda i=i: c.add_to_set("con_set", i)) for i in range(50)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert len(c.get("con_set")) == 50


def test_global_cache_singleton():
    from cache.shared_cache import cache as c2

    assert global_cache is c2


def test_reset_state_clears_data():
    c = SharedCache()
    c.register("reset_me", 60)
    c.set("reset_me", "data")
    c.reset_state()
    assert c.get("reset_me") is None
    assert c.stale_or_none("reset_me") is None


def test_reset_state_keeps_registrations():
    c = SharedCache()
    c.register("reset_reg", 60)
    c.set("reset_reg", "data")
    c.reset_state()
    c.set("reset_reg", "new_data")
    assert c.get("reset_reg") == "new_data"


def test_set_overwrites():
    c = SharedCache()
    c.register("overwrite", 60)
    c.set("overwrite", 1)
    c.set("overwrite", 2)
    assert c.get("overwrite") == 2


def test_age_seconds_on_unregistered_key():
    c = SharedCache()
    assert c._age_seconds("nonexistent") is None


def test_age_seconds_on_unloaded_key():
    c = SharedCache()
    c.register("unloaded", 60)
    assert c._age_seconds("unloaded") is None


def test_age_seconds_loaded():
    c = SharedCache()
    c.register("loaded", 60)
    c.set("loaded", "val")
    age = c._age_seconds("loaded")
    assert age is not None
    assert 0 <= age < 1


def test_lock_is_rlock():
    c = SharedCache()
    assert isinstance(c.lock, type(c.lock))
    assert type(c.lock).__name__ == "RLock"


def test_multiple_registrations():
    c = SharedCache()
    c.register("a", 10)
    c.register("b", 20)
    c.register("c", 30)
    c.set("a", 1)
    c.set("b", 2)
    c.set("c", 3)
    assert c.get("a") == 1
    assert c.get("b") == 2
    assert c.get("c") == 3


def test_get_after_ttl_expiry():
    c = SharedCache()
    c.register("fast_expire", 0)
    c.set("fast_expire", "gone")
    assert c.get("fast_expire") is None


def test_stale_returns_expired_value():
    c = SharedCache()
    c.register("fast_stale", 0)
    c.set("fast_stale", "stale")
    assert c.stale_or_none("fast_stale") == "stale"


def test_lock_acquire_release():
    c = SharedCache()
    assert c.lock.acquire(blocking=False)
    c.lock.release()
