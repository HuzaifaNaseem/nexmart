from __future__ import annotations

import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.product import Product
from app.schemas.common import MessageResponse, PaginatedResponse, PaginationParams
from app.schemas.product import (
    ProductCreate,
    ProductFilters,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter(prefix="/products", tags=["products"])


# ── helpers ───────────────────────────────────────────────────────────────────

def _slugify(name: str) -> str:
    slug = name.lower().replace(" ", "-")
    slug = re.sub(r"[^a-z0-9-]", "", slug)
    slug = re.sub(r"-+", "-", slug)
    slug = slug.strip("-")
    return slug


async def _unique_slug(
    db: AsyncSession,
    base_slug: str,
    exclude_id: uuid.UUID | None = None,
) -> str:
    candidate = base_slug
    counter = 1
    while True:
        query = select(Product.id).where(Product.slug == candidate)
        if exclude_id is not None:
            query = query.where(Product.id != exclude_id)
        result = await db.execute(query)
        if result.scalars().first() is None:
            return candidate
        counter += 1
        candidate = f"{base_slug}-{counter}"


async def _get_product_or_404(
    db: AsyncSession,
    product_id: uuid.UUID,
    *,
    active_only: bool = True,
) -> Product:
    query = select(Product).where(Product.id == product_id)
    if active_only:
        query = query.where(Product.is_active == True)  # noqa: E712
    result = await db.execute(query)
    product = result.scalars().first()
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


# ── GET / — list with filters + pagination ────────────────────────────────────

@router.get("/", response_model=PaginatedResponse[ProductResponse])
async def list_products(
    filters: ProductFilters = Depends(),
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
):
    query = select(Product).where(Product.is_active == True)  # noqa: E712

    if filters.search:
        pattern = f"%{filters.search}%"
        query = query.where(
            or_(
                Product.name.ilike(pattern),
                Product.description.ilike(pattern),
            )
        )
    if filters.category is not None:
        query = query.where(Product.category == filters.category)
    if filters.brand is not None:
        query = query.where(Product.brand == filters.brand)
    if filters.min_price is not None:
        query = query.where(Product.price >= filters.min_price)
    if filters.max_price is not None:
        query = query.where(Product.price <= filters.max_price)
    if filters.in_stock is True:
        query = query.where(Product.stock > 0)
    elif filters.in_stock is False:
        query = query.where(Product.stock == 0)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    sort_map = {
        "price_asc": Product.price.asc(),
        "price_desc": Product.price.desc(),
        "rating": Product.rating.desc(),
        "newest": Product.created_at.desc(),
        "name": Product.name.asc(),
    }
    query = query.order_by(
        sort_map.get(filters.sort_by, Product.created_at.desc())  # type: ignore[arg-type]
    )

    query = query.offset(pagination.offset).limit(pagination.limit)

    result = await db.execute(query)
    products = result.scalars().all()

    return PaginatedResponse.create(
        items=[ProductResponse.model_validate(p) for p in products],
        total=total,
        pagination=pagination,
    )


# ── GET /slug/{slug} — by slug (registered BEFORE /{product_id}) ─────────────

@router.get("/slug/{slug}", response_model=ProductResponse)
async def get_product_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
) -> ProductResponse:
    result = await db.execute(
        select(Product).where(Product.slug == slug, Product.is_active == True)  # noqa: E712
    )
    product = result.scalars().first()
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return ProductResponse.model_validate(product)


# ── GET /{product_id} — by UUID ──────────────────────────────────────────────

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ProductResponse:
    product = await _get_product_or_404(db, product_id, active_only=True)
    return ProductResponse.model_validate(product)


# ── POST / — create (admin) ──────────────────────────────────────────────────

@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_product(
    body: ProductCreate,
    _admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> ProductResponse:
    base_slug = _slugify(body.name)
    slug = await _unique_slug(db, base_slug)

    product = Product(
        id=uuid.uuid4(),
        slug=slug,
        **body.model_dump(),
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return ProductResponse.model_validate(product)


# ── PATCH /{product_id} — update (admin) ─────────────────────────────────────

@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: uuid.UUID,
    body: ProductUpdate,
    _admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> ProductResponse:
    product = await _get_product_or_404(db, product_id, active_only=False)

    update_data = body.model_dump(exclude_unset=True)

    if "name" in update_data:
        base_slug = _slugify(update_data["name"])
        update_data["slug"] = await _unique_slug(db, base_slug, exclude_id=product.id)

    for field, value in update_data.items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)
    return ProductResponse.model_validate(product)


# ── DELETE /{product_id} — soft-delete (admin) ───────────────────────────────

@router.delete("/{product_id}", response_model=MessageResponse)
async def delete_product(
    product_id: uuid.UUID,
    _admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    product = await _get_product_or_404(db, product_id, active_only=False)
    product.is_active = False
    await db.commit()
    return MessageResponse(message="Product deleted")
