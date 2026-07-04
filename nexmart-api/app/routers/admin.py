from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Schemas (inline, admin-only so no need for a separate file) ───────────────

class AdminStatsResponse(BaseModel):
    total_revenue: float
    total_orders: int
    total_users: int
    total_products: int
    orders_today: int
    revenue_today: float
    revenue_this_month: float
    pending_orders: int


class RevenuePoint(BaseModel):
    date: str
    revenue: float


class AdminOrderSummary(BaseModel):
    id: str
    user_email: str
    user_name: str
    total: float
    status: str
    item_count: int
    created_at: datetime


class AdminTopProduct(BaseModel):
    product_id: str
    product_name: str
    product_image: str | None
    total_sold: int
    revenue: float


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> AdminStatsResponse:
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)

    # Total revenue (non-cancelled orders)
    rev_result = await db.execute(
        select(func.coalesce(func.sum(Order.total), 0))
        .where(Order.status != "cancelled")
    )
    total_revenue = float(rev_result.scalar())

    # Total orders
    orders_result = await db.execute(select(func.count(Order.id)))
    total_orders = orders_result.scalar() or 0

    # Total users
    users_result = await db.execute(select(func.count(User.id)))
    total_users = users_result.scalar() or 0

    # Total active products
    prods_result = await db.execute(
        select(func.count(Product.id)).where(Product.is_active == True)  # noqa: E712
    )
    total_products = prods_result.scalar() or 0

    # Orders today
    today_orders_result = await db.execute(
        select(func.count(Order.id)).where(Order.created_at >= today_start)
    )
    orders_today = today_orders_result.scalar() or 0

    # Revenue today
    today_rev_result = await db.execute(
        select(func.coalesce(func.sum(Order.total), 0))
        .where(Order.created_at >= today_start, Order.status != "cancelled")
    )
    revenue_today = float(today_rev_result.scalar())

    # Revenue this month
    month_rev_result = await db.execute(
        select(func.coalesce(func.sum(Order.total), 0))
        .where(Order.created_at >= month_start, Order.status != "cancelled")
    )
    revenue_this_month = float(month_rev_result.scalar())

    # Pending orders
    pending_result = await db.execute(
        select(func.count(Order.id)).where(Order.status == "pending")
    )
    pending_orders = pending_result.scalar() or 0

    return AdminStatsResponse(
        total_revenue=total_revenue,
        total_orders=total_orders,
        total_users=total_users,
        total_products=total_products,
        orders_today=orders_today,
        revenue_today=revenue_today,
        revenue_this_month=revenue_this_month,
        pending_orders=pending_orders,
    )


@router.get("/revenue", response_model=list[RevenuePoint])
async def get_revenue_chart(
    days: int = Query(default=30, ge=7, le=90),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> list[RevenuePoint]:
    now = datetime.now(timezone.utc)
    start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc) - timedelta(days=days - 1)

    result = await db.execute(
        select(
            func.date(Order.created_at).label("day"),
            func.coalesce(func.sum(Order.total), 0).label("revenue"),
        )
        .where(Order.created_at >= start, Order.status != "cancelled")
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
    )
    rows = {str(row.day): float(row.revenue) for row in result}

    # Fill in zero-revenue days
    points: list[RevenuePoint] = []
    for i in range(days):
        d = (start + timedelta(days=i)).date().isoformat()
        points.append(RevenuePoint(date=d, revenue=rows.get(d, 0.0)))

    return points


@router.get("/orders/recent", response_model=list[AdminOrderSummary])
async def get_recent_orders(
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> list[AdminOrderSummary]:
    result = await db.execute(
        select(Order)
        .order_by(Order.created_at.desc())
        .limit(limit)
    )
    orders = list(result.scalars().all())

    summaries = []
    for o in orders:
        user_email = o.user.email if o.user else "guest"
        user_name = f"{o.user.first_name} {o.user.last_name[0]}." if o.user and o.user.last_name else (o.user.first_name if o.user else "Guest")
        summaries.append(AdminOrderSummary(
            id=str(o.id),
            user_email=user_email,
            user_name=user_name,
            total=float(o.total),
            status=o.status,
            item_count=sum(i.quantity for i in o.items),
            created_at=o.created_at,
        ))
    return summaries


@router.get("/products/top", response_model=list[AdminTopProduct])
async def get_top_products(
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> list[AdminTopProduct]:
    result = await db.execute(
        select(
            OrderItem.product_id,
            OrderItem.product_name,
            OrderItem.product_image,
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.quantity * OrderItem.unit_price).label("revenue"),
        )
        .join(Order, OrderItem.order_id == Order.id)
        .where(Order.status != "cancelled", OrderItem.product_id.isnot(None))
        .group_by(OrderItem.product_id, OrderItem.product_name, OrderItem.product_image)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
    )
    rows = result.all()
    return [
        AdminTopProduct(
            product_id=str(r.product_id),
            product_name=r.product_name,
            product_image=r.product_image,
            total_sold=int(r.total_sold),
            revenue=float(r.revenue),
        )
        for r in rows
    ]
