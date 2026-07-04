from __future__ import annotations

import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import (
    AddToCartRequest,
    CartItemResponse,
    CartSummaryResponse,
    UpdateCartItemRequest,
)

router = APIRouter(prefix="/cart", tags=["cart"])


# ── helpers ───────────────────────────────────────────────────────────────────

async def _get_cart_summary(db: AsyncSession, user_id: uuid.UUID) -> CartSummaryResponse:
    result = await db.execute(
        select(CartItem).where(CartItem.user_id == user_id)
    )
    items = result.scalars().all()

    subtotal = sum(
        (item.product.price * item.quantity for item in items),
        Decimal(0),
    )

    return CartSummaryResponse(
        items=[CartItemResponse.model_validate(i) for i in items],
        item_count=len(items),
        total_quantity=sum(i.quantity for i in items),
        subtotal=subtotal,
    )


async def _load_active_product(db: AsyncSession, product_id: uuid.UUID) -> Product:
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.is_active == True)  # noqa: E712
    )
    product = result.scalars().first()
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


async def _load_cart_item(
    db: AsyncSession,
    item_id: uuid.UUID,
    user_id: uuid.UUID,
) -> CartItem:
    result = await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user_id)
    )
    item = result.scalars().first()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )
    return item


# ── GET / — full cart ─────────────────────────────────────────────────────────

@router.get("/", response_model=CartSummaryResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartSummaryResponse:
    return await _get_cart_summary(db, current_user.id)


# ── POST / — add item ─────────────────────────────────────────────────────────

@router.post("/", response_model=CartSummaryResponse)
async def add_to_cart(
    body: AddToCartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartSummaryResponse:
    product = await _load_active_product(db, body.product_id)

    if product.stock < body.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock",
        )

    result = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == body.product_id,
        )
    )
    existing_item = result.scalars().first()

    if existing_item is not None:
        existing_item.quantity = min(
            existing_item.quantity + body.quantity,
            product.stock,
        )
    else:
        db.add(CartItem(
            id=uuid.uuid4(),
            user_id=current_user.id,
            product_id=body.product_id,
            quantity=body.quantity,
        ))

    await db.commit()
    return await _get_cart_summary(db, current_user.id)


# ── DELETE /clear — wipe cart (BEFORE /{item_id}) ────────────────────────────

@router.delete("/clear", response_model=CartSummaryResponse)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartSummaryResponse:
    await db.execute(
        delete(CartItem).where(CartItem.user_id == current_user.id)
    )
    await db.commit()
    return CartSummaryResponse(
        items=[],
        item_count=0,
        total_quantity=0,
        subtotal=Decimal(0),
    )


# ── PATCH /{item_id} — update quantity ────────────────────────────────────────

@router.patch("/{item_id}", response_model=CartSummaryResponse)
async def update_cart_item(
    item_id: uuid.UUID,
    body: UpdateCartItemRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartSummaryResponse:
    item = await _load_cart_item(db, item_id, current_user.id)
    product = await _load_active_product(db, item.product_id)

    if body.quantity > product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock",
        )

    item.quantity = body.quantity
    await db.commit()
    return await _get_cart_summary(db, current_user.id)


# ── DELETE /{item_id} — remove single item ────────────────────────────────────

@router.delete("/{item_id}", response_model=CartSummaryResponse)
async def remove_cart_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartSummaryResponse:
    item = await _load_cart_item(db, item_id, current_user.id)
    await db.delete(item)
    await db.commit()
    return await _get_cart_summary(db, current_user.id)
