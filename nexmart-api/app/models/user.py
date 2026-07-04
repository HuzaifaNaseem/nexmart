from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.cart import CartItem
    from app.models.order import Order
    from app.models.wishlist import WishlistItem


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    is_admin: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    points_balance: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────
    cart_items: Mapped[list[CartItem]] = relationship(
        "CartItem",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    wishlist_items: Mapped[list[WishlistItem]] = relationship(
        "WishlistItem",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    orders: Mapped[list[Order]] = relationship(
        "Order",
        back_populates="user",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
