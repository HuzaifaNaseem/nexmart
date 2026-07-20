"""Shared test fixtures.

Tests run against a dedicated `nexmart_test` database so they never touch
development data. Environment variables are set before importing the app so
the engine and settings pick up the test configuration.
"""

import os
import re
import uuid
from pathlib import Path

from dotenv import dotenv_values


def _test_database_url() -> str:
    """Point tests at a dedicated database.

    Credentials are never hardcoded here: an explicit TEST_DATABASE_URL wins,
    otherwise the developer's own (gitignored) .env is reused with the database
    name swapped for `nexmart_test`.
    """
    explicit = os.environ.get("TEST_DATABASE_URL")
    if explicit:
        return explicit

    env = dotenv_values(Path(__file__).resolve().parents[1] / ".env")
    base = env.get("DATABASE_URL") or (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/nexmart"
    )
    return re.sub(r"/[^/?]+(\?|$)", r"/nexmart_test\1", base)


_url = _test_database_url()

# Guard against a misconfigured URL: the schema is dropped between runs, so
# pointing this at a development or production database would destroy data.
_db_name = re.search(r"/([^/?]+)(?:\?|$)", _url)
if not _db_name or "test" not in _db_name.group(1).lower():
    raise RuntimeError(
        f"Refusing to run: test database name {_db_name.group(1) if _db_name else '?'!r} "
        "does not contain 'test'. Set TEST_DATABASE_URL to a dedicated database."
    )

# Must be configured before any `app.*` import — settings are read at import time.
os.environ["DATABASE_URL"] = _url
os.environ["DEBUG"] = "False"
os.environ["RATE_LIMIT_ENABLED"] = "False"
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-used-in-production")

import pytest  # noqa: E402
import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402

API = "/api/v1"


@pytest.fixture(scope="session")
def anyio_backend() -> str:
    return "asyncio"


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _schema():
    """Create a clean schema for the test session, then drop it."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def client():
    """HTTP client wired directly to the ASGI app (no network, no live server)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


async def _register(client: AsyncClient, **overrides) -> dict:
    payload = {
        "email": f"user_{uuid.uuid4().hex[:10]}@test.com",
        "password": "Password123!",
        "first_name": "Test",
        "last_name": "User",
        **overrides,
    }
    r = await client.post(f"{API}/auth/register", json=payload)
    assert r.status_code == 201, r.text
    body = r.json()
    return {
        "email": payload["email"],
        "password": payload["password"],
        "access_token": body["access_token"],
        "refresh_token": body["refresh_token"],
        "headers": {"Authorization": f"Bearer {body['access_token']}"},
    }


@pytest_asyncio.fixture
async def user(client) -> dict:
    """A freshly registered, authenticated shopper."""
    return await _register(client)


@pytest_asyncio.fixture
async def other_user(client) -> dict:
    """A second shopper — used to prove cross-user isolation."""
    return await _register(client)


@pytest_asyncio.fixture
async def admin(client) -> dict:
    """A registered user promoted to admin."""
    acct = await _register(client)
    async with engine.begin() as conn:
        await conn.execute(
            text("UPDATE users SET is_admin = true WHERE email = :email"),
            {"email": acct["email"]},
        )
    return acct


@pytest_asyncio.fixture
async def product(client, admin) -> dict:
    """A product in stock, created through the admin API."""
    payload = {
        "name": f"Test Product {uuid.uuid4().hex[:6]}",
        "description": "A product used by the test suite.",
        "price": 99.99,
        "original_price": 149.99,
        "stock": 25,
        "category": "Electronics",
        "brand": "TestBrand",
        "images": ["https://example.com/image.jpg"],
        "tags": ["Best Seller"],
    }
    r = await client.post(f"{API}/products/", headers=admin["headers"], json=payload)
    assert r.status_code in (200, 201), r.text
    return r.json()


@pytest.fixture
def shipping_address() -> dict:
    return {
        "name": "Test User",
        "address_line1": "1 Test Street",
        "address_line2": None,
        "city": "Karachi",
        "state": "Sindh",
        "postal_code": "74000",
        "country": "PK",
        "phone": "+923001234567",
    }
