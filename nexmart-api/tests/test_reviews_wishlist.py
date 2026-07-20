"""Reviews, wishlist, and admin analytics access control."""

from tests.conftest import API


# ── Reviews ──────────────────────────────────────────────────────────────────

async def test_list_reviews_is_public(client, product):
    r = await client.get(f"{API}/products/{product['id']}/reviews")
    assert r.status_code == 200


async def test_create_review(client, user, product):
    r = await client.post(
        f"{API}/products/{product['id']}/reviews",
        headers=user["headers"],
        json={"rating": 5, "title": "Excellent", "body": "Works exactly as described."},
    )
    assert r.status_code in (200, 201), r.text
    assert r.json()["rating"] == 5


async def test_same_user_cannot_review_twice(client, user, product):
    payload = {"rating": 5, "title": "First", "body": "First review."}
    await client.post(
        f"{API}/products/{product['id']}/reviews",
        headers=user["headers"],
        json=payload,
    )
    r = await client.post(
        f"{API}/products/{product['id']}/reviews",
        headers=user["headers"],
        json={"rating": 1, "title": "Second", "body": "Second review."},
    )
    assert r.status_code in (400, 409)


async def test_rating_above_five_is_rejected(client, user, product):
    r = await client.post(
        f"{API}/products/{product['id']}/reviews",
        headers=user["headers"],
        json={"rating": 11, "title": "Broken", "body": "Out of range."},
    )
    assert r.status_code == 422


async def test_rating_below_one_is_rejected(client, user, product):
    r = await client.post(
        f"{API}/products/{product['id']}/reviews",
        headers=user["headers"],
        json={"rating": 0, "title": "Broken", "body": "Out of range."},
    )
    assert r.status_code == 422


async def test_review_requires_authentication(client, product):
    r = await client.post(
        f"{API}/products/{product['id']}/reviews",
        json={"rating": 5, "title": "Anon", "body": "No token."},
    )
    assert r.status_code == 401


async def test_user_cannot_delete_another_users_review(
    client, user, other_user, product
):
    r = await client.post(
        f"{API}/products/{product['id']}/reviews",
        headers=user["headers"],
        json={"rating": 4, "title": "Mine", "body": "My review."},
    )
    review_id = r.json()["id"]

    r = await client.delete(
        f"{API}/reviews/{review_id}", headers=other_user["headers"]
    )
    assert r.status_code in (403, 404)


async def test_user_can_delete_own_review(client, user, product):
    r = await client.post(
        f"{API}/products/{product['id']}/reviews",
        headers=user["headers"],
        json={"rating": 4, "title": "Mine", "body": "My review."},
    )
    review_id = r.json()["id"]

    r = await client.delete(f"{API}/reviews/{review_id}", headers=user["headers"])
    assert r.status_code in (200, 204)


# ── Wishlist ─────────────────────────────────────────────────────────────────

async def test_wishlist_requires_authentication(client):
    assert (await client.get(f"{API}/wishlist/")).status_code == 401


async def test_add_and_remove_wishlist_item(client, user, product):
    r = await client.post(f"{API}/wishlist/{product['id']}", headers=user["headers"])
    assert r.status_code in (200, 201)

    r = await client.delete(f"{API}/wishlist/{product['id']}", headers=user["headers"])
    assert r.status_code in (200, 204)


async def test_duplicate_wishlist_add_does_not_duplicate(client, user, product):
    await client.post(f"{API}/wishlist/{product['id']}", headers=user["headers"])
    await client.post(f"{API}/wishlist/{product['id']}", headers=user["headers"])

    r = await client.get(f"{API}/wishlist/", headers=user["headers"])
    assert r.status_code == 200
    body = r.json()
    items = body if isinstance(body, list) else body.get("items", [])
    matching = [i for i in items if str(i.get("product_id", i.get("id"))) == product["id"]]
    assert len(matching) <= 1


# ── Admin analytics ──────────────────────────────────────────────────────────

ADMIN_ENDPOINTS = [
    "/admin/stats",
    "/admin/revenue",
    "/admin/orders/recent",
    "/admin/products/top",
]


async def test_admin_can_read_analytics(client, admin):
    for ep in ADMIN_ENDPOINTS:
        r = await client.get(f"{API}{ep}", headers=admin["headers"])
        assert r.status_code == 200, f"{ep} -> {r.status_code} {r.text}"


async def test_shopper_cannot_read_analytics(client, user):
    for ep in ADMIN_ENDPOINTS:
        r = await client.get(f"{API}{ep}", headers=user["headers"])
        assert r.status_code == 403, f"{ep} was reachable by a non-admin"


async def test_anonymous_cannot_read_analytics(client):
    for ep in ADMIN_ENDPOINTS:
        assert (await client.get(f"{API}{ep}")).status_code == 401


# ── Health ───────────────────────────────────────────────────────────────────

async def test_health(client):
    r = await client.get(f"{API}/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


async def test_database_health(client):
    assert (await client.get(f"{API}/health/db")).status_code == 200
