from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.product import Product
from app.models.user import User
from app.models.wishlist import WishlistItem
from app.schemas.wishlist import WishlistItemResponse, WishlistResponse

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


# ── helpers ───────────────────────────────────────────────────────────────────

async def _get_wishlist_response(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> WishlistResponse:
    result = await db.execute(
        select(WishlistItem).where(WishlistItem.user_id == user_id)
    )
    items = result.scalars().all()
    return WishlistResponse(
        items=[WishlistItemResponse.model_validate(i) for i in items],
        item_count=len(items),
    )


# ── GET / — full wishlist ─────────────────────────────────────────────────────

@router.get("/", response_model=WishlistResponse)
async def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WishlistResponse:
    return await _get_wishlist_response(db, current_user.id)


# ── POST /{product_id} — add (idempotent) ─────────────────────────────────────

@router.post("/{product_id}", response_model=WishlistResponse)
async def add_to_wishlist(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WishlistResponse:
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.is_active == True)  # noqa: E712
    )
    if result.scalars().first() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    result = await db.execute(
        select(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
    )
    if result.scalars().first() is not None:
        return await _get_wishlist_response(db, current_user.id)

    db.add(WishlistItem(
        id=uuid.uuid4(),
        user_id=current_user.id,
        product_id=product_id,
    ))
    await db.commit()
    return await _get_wishlist_response(db, current_user.id)


# ── DELETE /{product_id} — remove ────────────────────────────────────────────

@router.delete("/{product_id}", response_model=WishlistResponse)
async def remove_from_wishlist(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WishlistResponse:
    result = await db.execute(
        select(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
    )
    item = result.scalars().first()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found",
        )

    await db.delete(item)
    await db.commit()
    return await _get_wishlist_response(db, current_user.id)
