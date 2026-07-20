"""Authentication: registration, login, tokens, profile."""

import uuid

from tests.conftest import API


async def test_register_returns_tokens(client):
    r = await client.post(
        f"{API}/auth/register",
        json={
            "email": f"new_{uuid.uuid4().hex[:8]}@test.com",
            "password": "Password123!",
            "first_name": "New",
            "last_name": "Shopper",
        },
    )
    assert r.status_code == 201
    body = r.json()
    assert body["access_token"] and body["refresh_token"]


async def test_register_rejects_duplicate_email(client, user):
    r = await client.post(
        f"{API}/auth/register",
        json={
            "email": user["email"],
            "password": "Password123!",
            "first_name": "Dup",
            "last_name": "Licate",
        },
    )
    assert r.status_code == 400


async def test_register_rejects_invalid_email(client):
    r = await client.post(
        f"{API}/auth/register",
        json={
            "email": "not-an-email",
            "password": "Password123!",
            "first_name": "A",
            "last_name": "B",
        },
    )
    assert r.status_code == 422


async def test_register_rejects_short_password(client):
    r = await client.post(
        f"{API}/auth/register",
        json={
            "email": f"weak_{uuid.uuid4().hex[:8]}@test.com",
            "password": "123",
            "first_name": "A",
            "last_name": "B",
        },
    )
    assert r.status_code == 422


async def test_login_succeeds_with_correct_password(client, user):
    r = await client.post(
        f"{API}/auth/login",
        json={"email": user["email"], "password": user["password"]},
    )
    assert r.status_code == 200
    assert r.json()["access_token"]


async def test_login_rejects_wrong_password(client, user):
    r = await client.post(
        f"{API}/auth/login",
        json={"email": user["email"], "password": "WrongPassword1!"},
    )
    assert r.status_code == 401


async def test_login_rejects_unknown_email(client):
    r = await client.post(
        f"{API}/auth/login",
        json={"email": "ghost@test.com", "password": "Password123!"},
    )
    assert r.status_code == 401


async def test_password_longer_than_bcrypt_limit_is_accepted(client):
    """bcrypt truncates at 72 bytes; long passwords must not crash the API."""
    long_password = "A1!" + "x" * 100
    email = f"long_{uuid.uuid4().hex[:8]}@test.com"
    r = await client.post(
        f"{API}/auth/register",
        json={
            "email": email,
            "password": long_password,
            "first_name": "Long",
            "last_name": "Pass",
        },
    )
    assert r.status_code == 201

    r = await client.post(
        f"{API}/auth/login", json={"email": email, "password": long_password}
    )
    assert r.status_code == 200


async def test_refresh_token_issues_new_access_token(client, user):
    r = await client.post(
        f"{API}/auth/refresh", json={"refresh_token": user["refresh_token"]}
    )
    assert r.status_code == 200
    assert r.json()["access_token"]


async def test_access_token_rejected_as_refresh_token(client, user):
    r = await client.post(
        f"{API}/auth/refresh", json={"refresh_token": user["access_token"]}
    )
    assert r.status_code in (400, 401)


async def test_me_requires_authentication(client):
    assert (await client.get(f"{API}/auth/me")).status_code == 401


async def test_me_rejects_malformed_token(client):
    r = await client.get(
        f"{API}/auth/me", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert r.status_code == 401


async def test_me_returns_profile(client, user):
    r = await client.get(f"{API}/auth/me", headers=user["headers"])
    assert r.status_code == 200
    assert r.json()["email"] == user["email"]


async def test_update_profile(client, user):
    r = await client.patch(
        f"{API}/auth/me", headers=user["headers"], json={"first_name": "Renamed"}
    )
    assert r.status_code == 200
    assert r.json()["first_name"] == "Renamed"
