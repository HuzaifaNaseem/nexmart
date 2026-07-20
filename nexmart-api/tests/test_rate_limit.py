"""Brute-force protection on the login endpoint.

The rest of the suite runs with rate limiting disabled so fixtures can register
users freely; this module turns it back on for its own assertions.
"""

import uuid

import pytest

from app.config import settings
from app.rate_limit import RateLimiter
from tests.conftest import API


@pytest.fixture
def rate_limiting_on():
    settings.RATE_LIMIT_ENABLED = True
    yield
    settings.RATE_LIMIT_ENABLED = False


async def test_repeated_failed_logins_are_throttled(client, rate_limiting_on):
    email = f"target_{uuid.uuid4().hex[:8]}@test.com"
    statuses = []
    for _ in range(15):
        r = await client.post(
            f"{API}/auth/login", json={"email": email, "password": "WrongPassword1!"}
        )
        statuses.append(r.status_code)

    assert 429 in statuses, "login endpoint never throttled a burst of attempts"


async def test_limiter_allows_traffic_under_the_threshold():
    limiter = RateLimiter(times=3, seconds=60)

    class _Req:
        class client:
            host = "203.0.113.7"

        class url:
            path = "/test"

    settings.RATE_LIMIT_ENABLED = True
    try:
        for _ in range(3):
            await limiter(_Req())  # within budget — must not raise
        with pytest.raises(Exception):
            await limiter(_Req())  # fourth call exceeds it
    finally:
        settings.RATE_LIMIT_ENABLED = False
