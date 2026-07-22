"""
Catalog seeder — real product photography, multiple angles, genuine reviews.

Replaces the old Unsplash-lifestyle seed. Every product carries 3+ real product
shots on consistent backgrounds (WebP, CDN-served), which is what the storefront
gallery, zoom and thumbnail strip need.

Product ratings are NOT set directly — the API derives them from Review rows, so
this seeder posts the source catalogue's real reviews and lets the rating
recompute itself.

Run from the nexmart-api directory:

    NEXMART_ADMIN_PASSWORD=... python -m scripts.seed_catalog
    NEXMART_API_URL=https://... NEXMART_ADMIN_PASSWORD=... python -m scripts.seed_catalog

Flags:
    --keep-existing   don't deactivate the products already in the catalogue
    --limit N         seed at most N products
"""
import asyncio
import os
import ssl
import sys

import httpx

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

SOURCE = "https://dummyjson.com/products?limit=200"
BASE = os.environ.get("NEXMART_API_URL", "http://localhost:8001") + "/api/v1"
ADMIN_EMAIL = os.environ.get("NEXMART_ADMIN_EMAIL", "admin@nexmart.com")
ADMIN_PASSWORD = os.environ.get("NEXMART_ADMIN_PASSWORD", "")
REVIEWER_PASSWORD = os.environ.get("NEXMART_REVIEWER_PASSWORD", "Reviewer123!Seed")

MIN_IMAGES = 3          # a product needs several angles to be worth showing
REVIEWER_POOL = 30      # distinct reviewer accounts to spread reviews across

# Rating -> short headline. Derived from the reviewer's own score, never invented.
RATING_TITLE = {
    5: "Excellent",
    4: "Very good",
    3: "Decent",
    2: "Disappointing",
    1: "Poor",
}


def _ssl_context():
    """Verify TLS via the OS trust store where available (TLS-inspecting AV)."""
    try:
        import truststore

        return truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    except ImportError:
        return True


def prettify_category(slug: str) -> str:
    words = slug.replace("-", " ").split()
    out = []
    for w in words:
        if w == "mens":
            out.append("Men's")
        elif w == "womens":
            out.append("Women's")
        else:
            out.append(w.capitalize())
    return " ".join(out)


def build_tags(p: dict) -> list[str]:
    tags = [t.title() for t in p.get("tags", [])]
    discount = p.get("discountPercentage") or 0
    rating = p.get("rating") or 0
    # Badges the storefront knows how to render.
    if discount >= 15:
        tags.append("Hot Deal")
    elif rating >= 4.5:
        tags.append("Best Seller")
    elif discount > 0:
        tags.append("Sale")
    return tags


def to_payload(p: dict) -> dict:
    price = round(float(p["price"]), 2)
    discount = float(p.get("discountPercentage") or 0)
    original = round(price / (1 - discount / 100), 2) if discount > 0 else None
    return {
        "name": p["title"],
        "description": p["description"],
        "price": price,
        "original_price": original,
        "stock": int(p.get("stock") or 0),
        "category": prettify_category(p["category"]),
        "brand": p.get("brand") or p["title"].split()[0],
        "images": p["images"],
        "tags": build_tags(p),
    }


async def fetch_all_products(client) -> list[dict]:
    """Walk every page — the API caps `limit` at 100."""
    items, page = [], 1
    while True:
        r = await client.get("/products/", params={"limit": 100, "page": page})
        if r.status_code != 200:
            print(f"   ⚠  product listing failed: {r.status_code} {r.text[:120]}")
            break
        body = r.json()
        items.extend(body["items"])
        if page >= body.get("pages", 1) or not body["items"]:
            break
        page += 1
    return items


async def post_with_retry(client, method, url, *, retries=6, **kw):
    """Registration and review endpoints are rate limited; back off politely."""
    for attempt in range(retries):
        r = await client.request(method, url, **kw)
        if r.status_code != 429:
            return r
        await asyncio.sleep(7 * (attempt + 1))
    return r


async def login_admin(client) -> str:
    r = await client.post(
        "/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if r.status_code != 200:
        print(f"✗  Admin login failed ({r.status_code}): {r.text[:200]}")
        print("   Set NEXMART_ADMIN_PASSWORD, and make sure the account is an admin:")
        print(f"   UPDATE users SET is_admin = true WHERE email = '{ADMIN_EMAIL}';")
        sys.exit(1)
    print("✓  Signed in as admin")
    return r.json()["access_token"]


async def build_reviewer_pool(client, names: list[str]) -> list[dict]:
    """Register (or sign in) the reviewer accounts that will post reviews."""
    pool = []
    print(f"\n👤  Preparing {len(names)} reviewer accounts...")
    for i, full_name in enumerate(names, 1):
        first, _, last = full_name.partition(" ")
        email = f"reviewer{i:02d}@nexmart-demo.com"
        r = await post_with_retry(
            client, "POST", "/auth/register",
            json={
                "email": email,
                "password": REVIEWER_PASSWORD,
                "first_name": first or "Reviewer",
                "last_name": last or str(i),
            },
        )
        if r.status_code == 400:  # already registered
            r = await post_with_retry(
                client, "POST", "/auth/login",
                json={"email": email, "password": REVIEWER_PASSWORD},
            )
        if r.status_code not in (200, 201):
            print(f"   ⚠  {email}: {r.status_code} {r.text[:90]}")
            continue
        pool.append({
            "name": full_name,
            "headers": {"Authorization": f"Bearer {r.json()['access_token']}"},
        })
        if i % 10 == 0:
            print(f"   ...{len(pool)}/{len(names)} ready")
    print(f"✓  {len(pool)} reviewers ready")
    return pool


async def seed():
    if not ADMIN_PASSWORD:
        print("Set NEXMART_ADMIN_PASSWORD before seeding.")
        sys.exit(1)

    keep_existing = "--keep-existing" in sys.argv
    limit = None
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])

    print("\n🌱  NEXMART Catalog Seeder")
    print("=" * 62)
    print(f"    Target: {BASE}")

    verify = _ssl_context()
    async with httpx.AsyncClient(timeout=90, verify=verify) as raw:
        src = (await raw.get(SOURCE)).json()["products"]

    products = [p for p in src if len(p.get("images", [])) >= MIN_IMAGES]
    if limit:
        products = products[:limit]
    print(f"    Source: {len(products)} products with {MIN_IMAGES}+ real angles")

    async with httpx.AsyncClient(base_url=BASE, timeout=90, verify=verify) as client:
        token = await login_admin(client)
        admin_h = {"Authorization": f"Bearer {token}"}

        # ── Retire the old stock-photo catalogue ─────────────────────────────
        if not keep_existing:
            old = await fetch_all_products(client)
            if old:
                print(f"\n🗑  Retiring {len(old)} existing products (soft delete, "
                      f"past orders keep their history)...")
                for p in old:
                    await client.delete(f"/products/{p['id']}", headers=admin_h)
                print("✓  Old catalogue retired")

        # ── Create products ──────────────────────────────────────────────────
        print(f"\n📦  Creating {len(products)} products...\n")
        created = []
        for p in products:
            payload = to_payload(p)
            r = await client.post("/products/", headers=admin_h, json=payload)
            if r.status_code in (200, 201):
                created.append((r.json(), p))
                imgs = len(payload["images"])
                was = f"  (was ${payload['original_price']})" if payload["original_price"] else ""
                print(f"  ✓  {payload['name'][:40]:42s} ${payload['price']:>9,.2f}{was:22s}"
                      f" {imgs} angles  [{payload['category']}]")
            else:
                print(f"  ✗  {payload['name'][:40]:42s} {r.status_code} {r.text[:80]}")
        print(f"\n✓  {len(created)} products created")

        # ── Reviews (ratings derive from these) ──────────────────────────────
        names, seen = [], set()
        for _, p in created:
            for rv in p.get("reviews", []):
                n = rv["reviewerName"]
                if n not in seen:
                    seen.add(n)
                    names.append(n)
            if len(names) >= REVIEWER_POOL:
                break
        pool = await build_reviewer_pool(client, names[:REVIEWER_POOL])

        if pool:
            print(f"\n⭐  Posting reviews for {len(created)} products...")
            posted = failed = 0
            for idx, (prod, p) in enumerate(created):
                for slot, rv in enumerate(p.get("reviews", [])[:3]):
                    # Distinct reviewer per slot so no user reviews a product twice.
                    reviewer = pool[(idx * 3 + slot) % len(pool)]
                    body = (rv.get("comment") or "").strip()
                    if not body:
                        continue
                    r = await post_with_retry(
                        client, "POST", f"/products/{prod['id']}/reviews",
                        headers=reviewer["headers"],
                        json={
                            "rating": int(rv["rating"]),
                            "title": RATING_TITLE.get(int(rv["rating"]), "Review"),
                            "body": body[:1000],
                        },
                    )
                    if r.status_code in (200, 201):
                        posted += 1
                    else:
                        failed += 1
                if (idx + 1) % 20 == 0:
                    print(f"   ...{idx + 1}/{len(created)} products ({posted} reviews)")
            print(f"✓  {posted} reviews posted" + (f", {failed} skipped" if failed else ""))

        # ── Report ───────────────────────────────────────────────────────────
        items = await fetch_all_products(client)
        rated = [i for i in items if float(i["rating"]) > 0]
        cats = sorted({i["category"] for i in items})
        print("\n" + "=" * 62)
        print(f"🎉  Catalogue live: {len(items)} products")
        print(f"    {len(rated)} with computed star ratings")
        print(f"    {len(cats)} categories: {', '.join(cats[:8])}"
              + (" ..." if len(cats) > 8 else ""))


asyncio.run(seed())
