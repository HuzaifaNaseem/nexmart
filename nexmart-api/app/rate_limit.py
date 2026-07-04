"""Lightweight in-memory rate limiting.

Implemented as a FastAPI dependency (not a decorator) so it composes cleanly
with routers that use postponed annotations. Per-IP, per-endpoint sliding
window. Suitable for single-process deployments; swap the storage for Redis
when scaling horizontally.
"""

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status


class RateLimiter:
    def __init__(self, times: int, seconds: int) -> None:
        self.times = times
        self.seconds = seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    async def __call__(self, request: Request) -> None:
        ip = request.client.host if request.client else "unknown"
        key = f"{request.url.path}:{ip}"
        now = time.monotonic()

        window = self._hits[key]
        while window and now - window[0] > self.seconds:
            window.popleft()

        if len(window) >= self.times:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )
        window.append(now)
