from __future__ import annotations

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, JSON, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.product import Product
    from app.models.user import User


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False,
    )
    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    shipping_fee: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        nullable=False,
    )
    total: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    shipping_address: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )
    payment_intent_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    points_earned: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────
    user: Mapped[User | None] = relationship(
        "User",
        back_populates="orders",
        lazy="selectin",
    )
    items: Mapped[list[OrderItem]] = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Order {self.id} status={self.status}>"


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
    )
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
    )
    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    product_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    product_image: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # ── Relationships ─────────────────────────────────────────────────────
    order: Mapped[Order] = relationship(
        "Order",
        back_populates="items",
        lazy="selectin",
    )
    product: Mapped[Product | None] = relationship(
        "Product",
        back_populates="order_items",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<OrderItem {self.product_name} x{self.quantity}>"
