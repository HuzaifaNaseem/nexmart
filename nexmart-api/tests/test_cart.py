"""Cart: adding, merging, quantity rules, and per-user isolation."""

import uuid

from tests.conftest import API


async def test_new_cart_is_empty(client, user):
    r = await client.get(f"{API}/cart/", headers=user["headers"])
    assert r.status_code == 200
    assert r.json()["items"] == []


async def test_cart_requires_authentication(client):
    assert (await client.get(f"{API}/cart/")).status_code == 401


async def test_add_item_to_cart(client, user, product):
    r = await client.post(
        f"{API}/cart/",
        headers=user["headers"],
        json={"product_id": product["id"], "quantity": 2},
    )
    assert r.status_code in (200, 201)

    cart = (await client.get(f"{API}/cart/", headers=user["headers"])).json()
    assert len(cart["items"]) == 1
    assert cart["items"][0]["quantity"] == 2


async def test_adding_same_product_merges_quantity(client, user, product):
    for _ in range(2):
        await client.post(
            f"{API}/cart/",
            headers=user["headers"],
            json={"product_id": product["id"], "quantity": 2},
        )
    cart = (await client.get(f"{API}/cart/", headers=user["headers"])).json()
    assert len(cart["items"]) == 1
    assert cart["items"][0]["quantity"] == 4


async def test_cannot_add_more_than_stock(client, user, product):
    r = await client.post(
        f"{API}/cart/",
        headers=user["headers"],
        json={"product_id": product["id"], "quantity": product["stock"] + 1},
    )
    assert r.status_code == 400


async def test_zero_quantity_is_rejected(client, user, product):
    r = await client.post(
        f"{API}/cart/",
        headers=user["headers"],
        json={"product_id": product["id"], "quantity": 0},
    )
    assert r.status_code == 422


async def test_negative_quantity_is_rejected(client, user, product):
    r = await client.post(
        f"{API}/cart/",
        headers=user["headers"],
        json={"product_id": product["id"], "quantity": -3},
    )
    assert r.status_code == 422


async def test_adding_unknown_product_returns_404(client, user):
    r = await client.post(
        f"{API}/cart/",
        headers=user["headers"],
        json={"product_id": str(uuid.uuid4()), "quantity": 1},
    )
    assert r.status_code == 404


async def test_update_cart_item_quantity(client, user, product):
    await client.post(
        f"{API}/cart/",
        headers=user["headers"],
        json={"product_id": product["id"], "quantity": 2},
    )
    cart = (await client.get(f"{API}/cart/", headers=user["headers"])).json()
    item_id = cart["items"][0]["id"]

    r = await client.patch(
        f"{API}/cart/{item_id}", headers=user["headers"], json={"quantity": 5}
    )
    assert r.status_code == 200


async def test_clear_cart(client, user, product):
    await client.post(
        f"{API}/cart/",
        headers=user["headers"],
        json={"product_id": product["id"], "quantity": 1},
    )
    r = await client.delete(f"{API}/cart/clear", headers=user["headers"])
    assert r.status_code in (200, 204)

    cart = (await client.get(f"{API}/cart/", headers=user["headers"])).json()
    assert cart["items"] == []


async def test_user_cannot_modify_another_users_cart_item(
    client, user, other_user, product
):
    await client.post(
        f"{API}/cart/",
        headers=user["headers"],
        json={"product_id": product["id"], "quantity": 1},
    )
    cart = (await client.get(f"{API}/cart/", headers=user["headers"])).json()
    item_id = cart["items"][0]["id"]

    r = await client.patch(
        f"{API}/cart/{item_id}", headers=other_user["headers"], json={"quantity": 99}
    )
    assert r.status_code in (403, 404)


async def test_user_cannot_delete_another_users_cart_item(
    client, user, other_user, product
):
    await client.post(
        f"{API}/cart/",
        headers=user["headers"],
        json={"product_id": product["id"], "quantity": 1},
    )
    cart = (await client.get(f"{API}/cart/", headers=user["headers"])).json()
    item_id = cart["items"][0]["id"]

    r = await client.delete(f"{API}/cart/{item_id}", headers=other_user["headers"])
    assert r.status_code in (403, 404)
