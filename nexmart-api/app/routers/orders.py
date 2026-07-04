from __future__ import annotations

import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_admin, get_current_user
from app.models.cart import CartItem
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.common import PaginatedResponse, PaginationParams
from app.schemas.order import (
    CheckoutRequest,
    OrderResponse,
    UpdateOrderStatusRequest,
)

router = APIRouter(prefix="/orders", tags=["orders"])

VALID_STATUSES = {
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
}


# ── helpers ───────────────────────────────────────────────────────────────────

async def _load_order_or_404(db: AsyncSession, order_id: uuid.UUID) -> Order:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalars().first()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return order


async def _paginate_orders(
    db: AsyncSession,
    where_clause,
    pagination: PaginationParams,
) -> PaginatedResponse[OrderResponse]:
    count_result = await db.execute(
        select(func.count()).select_from(Order).where(where_clause)
    )
    total = count_result.scalar() or 0

    result = await db.execute(
        select(Order)
        .where(where_clause)
        .order_by(Order.created_at.desc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )
    orders = result.scalars().all()

    return PaginatedResponse.create(
        items=[OrderResponse.model_validate(o) for o in orders],
        total=total,
        pagination=pagination,
    )


# ── POST /checkout ────────────────────────────────────────────────────────────

@router.post(
    "/checkout",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def checkout(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    )
    cart_items = result.scalars().all()

    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    for ci in cart_items:
        if not ci.product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{ci.product.name} is no longer available",
            )
        if ci.product.stock < ci.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {ci.product.name}",
            )

    subtotal = sum(
        (ci.product.price * ci.quantity for ci in cart_items),
        Decimal("0.00"),
    )
    shipping_fee = Decimal("0.00") if subtotal >= 50 else Decimal("5.99")
    total = subtotal + shipping_fee
    points_earned = int(total)

    order = Order(
        id=uuid.uuid4(),
        user_id=current_user.id,
        status="pending",
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        total=total,
        shipping_address=body.shipping_address.model_dump(),
        points_earned=points_earned,
    )
    db.add(order)
    await db.flush()

    for ci in cart_items:
        db.add(OrderItem(
            id=uuid.uuid4(),
            order_id=order.id,
            product_id=ci.product_id,
            quantity=ci.quantity,
            unit_price=ci.product.price,
            product_name=ci.product.name,
            product_image=ci.product.images[0] if ci.product.images else None,
        ))
        ci.product.stock -= ci.quantity

    current_user.points_balance += points_earned

    await db.execute(
        delete(CartItem).where(CartItem.user_id == current_user.id)
    )

    await db.commit()
    await db.refresh(order)
    return OrderResponse.model_validate(order)


# ── GET / — current user's orders ────────────────────────────────────────────

@router.get("/", response_model=PaginatedResponse[OrderResponse])
async def list_my_orders(
    current_user: User = Depends(get_current_user),
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[OrderResponse]:
    return await _paginate_orders(db, Order.user_id == current_user.id, pagination)


# ── GET /admin — all orders (admin) — BEFORE /{order_id} ─────────────────────

@router.get("/admin", response_model=PaginatedResponse[OrderResponse])
async def list_all_orders(
    order_status: str | None = Query(default=None, alias="status"),
    _admin: User = Depends(get_current_admin),
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[OrderResponse]:
    where_clause = Order.status == order_status if order_status is not None else True
    return await _paginate_orders(db, where_clause, pagination)


# ── GET /{order_id} — single order ───────────────────────────────────────────

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    order = await _load_order_or_404(db, order_id)

    if not current_user.is_admin and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order",
        )

    return OrderResponse.model_validate(order)


# ── PATCH /{order_id}/cancel — BEFORE /{order_id}/status ─────────────────────

@router.patch("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    order = await _load_order_or_404(db, order_id)

    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this order",
        )

    if order.status not in ("pending", "confirmed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order cannot be cancelled at this stage",
        )

    for oi in order.items:
        if oi.product_id is not None:
            result = await db.execute(
                select(Product).where(Product.id == oi.product_id)
            )
            product = result.scalars().first()
            if product is not None:
                product.stock += oi.quantity

    current_user.points_balance = max(0, current_user.points_balance - order.points_earned)
    order.status = "cancelled"
    await db.commit()
    await db.refresh(order)
    return OrderResponse.model_validate(order)


# ── PATCH /{order_id}/status — admin ─────────────────────────────────────────

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: uuid.UUID,
    body: UpdateOrderStatusRequest,
    _admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    if body.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status",
        )

    order = await _load_order_or_404(db, order_id)
    order.status = body.status
    await db.commit()
    await db.refresh(order)
    return OrderResponse.model_validate(order)
