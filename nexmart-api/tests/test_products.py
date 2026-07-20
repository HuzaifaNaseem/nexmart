"""Product catalog: listing, filtering, sorting, detail, admin CRUD."""

import uuid

from tests.conftest import API


async def test_list_products(client, product):
    r = await client.get(f"{API}/products/")
    assert r.status_code == 200
    assert r.json()["total"] >= 1


async def test_pagination_respects_limit(client, admin):
    for _ in range(3):
        await client.post(
            f"{API}/products/",
            headers=admin["headers"],
            json={
                "name": f"Paged {uuid.uuid4().hex[:6]}",
                "description": "d",
                "price": 10,
                "stock": 5,
                "category": "Test",
                "brand": "B",
                "images": [],
                "tags": [],
            },
        )
    r = await client.get(f"{API}/products/", params={"limit": 2})
    assert r.status_code == 200
    assert len(r.json()["items"]) == 2


async def test_filter_by_category(client, product):
    r = await client.get(f"{API}/products/", params={"category": product["category"]})
    assert r.status_code == 200
    assert all(p["category"] == product["category"] for p in r.json()["items"])


async def test_price_range_filter(client, product):
    r = await client.get(f"{API}/products/", params={"min_price": 50, "max_price": 200})
    assert r.status_code == 200
    assert all(50 <= float(p["price"]) <= 200 for p in r.json()["items"])


async def test_invalid_price_filter_is_rejected(client):
    r = await client.get(f"{API}/products/", params={"min_price": "abc"})
    assert r.status_code == 422


async def test_search_matches_product_name(client, product):
    term = product["name"].split()[0]
    r = await client.get(f"{API}/products/", params={"search": term})
    assert r.status_code == 200
    assert r.json()["total"] >= 1


async def test_sort_by_price_ascending(client, product, admin):
    await client.post(
        f"{API}/products/",
        headers=admin["headers"],
        json={
            "name": f"Cheap {uuid.uuid4().hex[:6]}",
            "description": "d",
            "price": 1.99,
            "stock": 5,
            "category": "Test",
            "brand": "B",
            "images": [],
            "tags": [],
        },
    )
    r = await client.get(f"{API}/products/", params={"sort_by": "price_asc"})
    prices = [float(p["price"]) for p in r.json()["items"]]
    assert prices == sorted(prices)


async def test_product_detail(client, product):
    r = await client.get(f"{API}/products/{product['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == product["id"]


async def test_missing_product_returns_404(client):
    assert (await client.get(f"{API}/products/{uuid.uuid4()}")).status_code == 404


async def test_malformed_product_id_is_handled(client):
    r = await client.get(f"{API}/products/not-a-uuid")
    assert r.status_code in (404, 422)


async def test_openapi_schema_is_served(client):
    """Regression: a bad type annotation once made this return 500."""
    r = await client.get("/openapi.json")
    assert r.status_code == 200
    assert "paths" in r.json()


# ── Admin-only operations ────────────────────────────────────────────────────

async def test_shopper_cannot_create_product(client, user):
    r = await client.post(
        f"{API}/products/",
        headers=user["headers"],
        json={
            "name": "Hacked",
            "description": "d",
            "price": 1,
            "stock": 1,
            "category": "C",
            "brand": "B",
            "images": [],
            "tags": [],
        },
    )
    assert r.status_code == 403


async def test_anonymous_cannot_create_product(client):
    r = await client.post(
        f"{API}/products/",
        json={
            "name": "Anon",
            "description": "d",
            "price": 1,
            "stock": 1,
            "category": "C",
            "brand": "B",
            "images": [],
            "tags": [],
        },
    )
    assert r.status_code == 401


async def test_admin_can_update_and_delete_product(client, admin, product):
    r = await client.patch(
        f"{API}/products/{product['id']}",
        headers=admin["headers"],
        json={"price": 55.55},
    )
    assert r.status_code == 200
    assert float(r.json()["price"]) == 55.55

    r = await client.delete(
        f"{API}/products/{product['id']}", headers=admin["headers"]
    )
    assert r.status_code in (200, 204)


async def test_shopper_cannot_delete_product(client, user, product):
    r = await client.delete(f"{API}/products/{product['id']}", headers=user["headers"])
    assert r.status_code == 403
