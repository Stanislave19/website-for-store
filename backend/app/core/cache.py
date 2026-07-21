import time
from typing import Callable, TypeVar

T = TypeVar("T")

# Простий in-process TTL-кеш — узгоджено з тим самим припущенням, що і
# app/core/rate_limit.py: MVP працює в одному backend-контейнері (один
# процес), тому кеш у пам'яті достатній. Якщо колись буде кілька інстансів
# backend, варто перенести в Redis (спільний для всіх інстансів).


def ttl_cache(ttl_seconds: float) -> Callable[[Callable[[], T]], Callable[[], T]]:
    def decorator(func: Callable[[], T]) -> Callable[[], T]:
        state: dict[str, object] = {"value": None, "expires_at": 0.0}

        def wrapper() -> T:
            now = time.monotonic()
            if state["value"] is None or now >= state["expires_at"]:
                state["value"] = func()
                state["expires_at"] = now + ttl_seconds
            return state["value"]  # type: ignore[return-value]

        return wrapper

    return decorator
