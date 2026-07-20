"""Checkout and orders — the money path. Stock accounting matters most here."""

from tests.conftest import API


async def _stock(client, product_id) -> int:
    r = await client.get(f"{API}/products/{product_id}")
    return r.json()["stock"]


async def _checkout(client, user, product, shipping_address, qty=2):
    await client.delete(f"{API}/cart/clear", headers=user["headers"])
    await client.post(
        f"{API}/cart/",
        headers=user["headers"],
        json={"product_id": product["id"], "quantity": qty},
    )
    return await client.post(
        f"{API}/orders/checkout",
        headers=user["headers"],
        json={"shipping_address": shipping_address},
    )


async def test_checkout_creates_order(client, user, product, shipping_address):
    r = await _checkout(client, user, product, shipping_address)
    assert r.status_code in (200, 201), r.text
    order = r.json()
    assert order["status"] == "pending"
    assert len(order["items"]) == 1


async def test_checkout_decrements_stock(client, user, product, shipping_address):
    before = await _stock(client, product["id"])
    await _checkout(client, user, product, shipping_address, qty=2)
    assert await _stock(client, product["id"]) == before - 2


async def test_checkout_empties_the_cart(client, user, product, shipping_address):
    await _checkout(client, user, product, shipping_address)
    cart = (await client.get(f"{API}/cart/", headers=user["headers"])).json()
    assert cart["items"] == []


async def test_checkout_with_empty_cart_is_rejected(client, user, shipping_address):
    await client.delete(f"{API}/cart/clear", headers=user["headers"])
    r = await client.post(
        f"{API}/orders/checkout",
        headers=user["headers"],
        json={"shipping_address": shipping_address},
    )
    assert r.status_code == 400


async def test_checkout_rejects_incomplete_address(client, user, product):
    await client.post(
        f"{API}/cart/",
        headers=user["headers"],
        json={"product_id": product["id"], "quantity": 1},
    )
    r = await client.post(
        f"{API}/orders/checkout",
        headers=user["headers"],
        json={"shipping_address": {"name": "Only A Name"}},
    )
    assert r.status_code == 422


async def test_checkout_requires_authentication(client, shipping_address):
    r = await client.post(
        f"{API}/orders/checkout", json={"shipping_address": shipping_address}
    )
    assert r.status_code == 401


async def test_order_totals_include_shipping_for_small_baskets(
    client, user, product, shipping_address, admin
):
    """Orders under the free-shipping threshold carry a shipping fee."""
    r = await client.post(
        f"{API}/products/",
        headers=admin["headers"],
        json={
            "name": "Cheap Item",
            "description": "d",
            "price": 5.00,
            "stock": 10,
            "category": "Test",
            "brand": "B",
            "images": [],
            "tags": [],
        },
    )
    cheap = r.json()
    r = await _checkout(client, user, cheap, shipping_address, qty=1)
    order = r.json()
    assert float(order["shipping_fee"]) > 0
    assert float(order["total"]) == float(order["subtotal"]) + float(
        order["shipping_fee"]
    )


async def test_user_sees_only_their_own_orders(
    client, user, other_user, product, shipping_address
):
    r = await _checkout(client, user, product, shipping_address)
    order_id = r.json()["id"]

    assert (
        await client.get(f"{API}/orders/{order_id}", headers=other_user["headers"])
    ).status_code in (403, 404)


async def test_user_can_view_own_order(client, user, product, shipping_address):
    r = await _checkout(client, user, product, shipping_address)
    order_id = r.json()["id"]
    r = await client.get(f"{API}/orders/{order_id}", headers=user["headers"])
    assert r.status_code == 200


async def test_cancel_restores_stock(client, user, product, shipping_address):
    before = await _stock(client, product["id"])
    r = await _checkout(client, user, product, shipping_address, qty=2)
    order_id = r.json()["id"]

    r = await client.patch(
        f"{API}/orders/{order_id}/cancel", headers=user["headers"]
    )
    assert r.status_code == 200
    assert await _stock(client, product["id"]) == before


async def test_order_cannot_be_cancelled_twice(
    client, user, product, shipping_address
):
    """Double cancellation would credit stock back twice."""
    r = await _checkout(client, user, product, shipping_address)
    order_id = r.json()["id"]

    await client.patch(f"{API}/orders/{order_id}/cancel", headers=user["headers"])
    r = await client.patch(f"{API}/orders/{order_id}/cancel", headers=user["headers"])
    assert r.status_code == 400


async def test_user_cannot_cancel_another_users_order(
    client, user, other_user, product, shipping_address
):
    r = await _checkout(client, user, product, shipping_address)
    order_id = r.json()["id"]

    r = await client.patch(
        f"{API}/orders/{order_id}/cancel", headers=other_user["headers"]
    )
    assert r.status_code in (403, 404)


async def test_shopper_cannot_change_order_status(
    client, user, product, shipping_address
):
    r = await _checkout(client, user, product, shipping_address)
    order_id = r.json()["id"]

    r = await client.patch(
        f"{API}/orders/{order_id}/status",
        headers=user["headers"],
        json={"status": "shipped"},
    )
    assert r.status_code == 403


async def test_admin_can_change_order_status(
    client, user, admin, product, shipping_address
):
    r = await _checkout(client, user, product, shipping_address)
    order_id = r.json()["id"]

    r = await client.patch(
        f"{API}/orders/{order_id}/status",
        headers=admin["headers"],
        json={"status": "shipped"},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "shipped"


async def test_invalid_order_status_is_rejected(
    client, user, admin, product, shipping_address
):
    r = await _checkout(client, user, product, shipping_address)
    order_id = r.json()["id"]

    r = await client.patch(
        f"{API}/orders/{order_id}/status",
        headers=admin["headers"],
        json={"status": "teleported"},
    )
    assert r.status_code == 422


async def test_shopper_cannot_list_all_orders(client, user):
    assert (
        await client.get(f"{API}/orders/admin", headers=user["headers"])
    ).status_code == 403
