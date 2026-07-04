from __future__ import annotations

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Integer, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.cart import CartItem
    from app.models.order import OrderItem
    from app.models.review import Review
    from app.models.wishlist import WishlistItem


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    slug: Mapped[str] = mapped_column(
        String(280),
        unique=True,
        index=True,
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    original_price: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    stock: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    brand: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    rating: Mapped[Decimal] = mapped_column(
        Numeric(3, 2),
        default=0,
        nullable=False,
    )
    review_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    images: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )
    tags: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────
    cart_items: Mapped[list[CartItem]] = relationship(
        "CartItem",
        back_populates="product",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    wishlist_items: Mapped[list[WishlistItem]] = relationship(
        "WishlistItem",
        back_populates="product",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    order_items: Mapped[list[OrderItem]] = relationship(
        "OrderItem",
        back_populates="product",
        lazy="selectin",
    )
    reviews: Mapped[list[Review]] = relationship(
        "Review",
        back_populates="product",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Product {self.name}>"
