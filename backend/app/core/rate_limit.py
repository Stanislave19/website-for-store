import time
from collections import defaultdict

from fastapi import HTTPException, Request

# Проста реалізація rate-limit в пам'яті процесу — для MVP з одним backend-контейнером
# цього достатньо. Якщо колись буде кілька інстансів backend, треба винести в Redis
# (спільний для всіх інстансів, інакше кожен рахує ліміт окремо).


def make_rate_limiter(*, max_requests: int, window_seconds: int, message: str):
    request_log: dict[str, list[float]] = defaultdict(list)

    def rate_limit(request: Request) -> None:
        ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        recent = [t for t in request_log[ip] if now - t < window_seconds]
        if len(recent) >= max_requests:
            raise HTTPException(status_code=429, detail=message)
        recent.append(now)
        request_log[ip] = recent

    return rate_limit
