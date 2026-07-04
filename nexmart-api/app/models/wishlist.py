from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.product import Product
    from app.models.user import User


class WishlistItem(Base, TimestampMixin):
    __tablename__ = "wishlist_items"

    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_wishlist_user_product"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────
    user: Mapped[User] = relationship(
        "User",
        back_populates="wishlist_items",
        lazy="selectin",
    )
    product: Mapped[Product] = relationship(
        "Product",
        back_populates="wishlist_items",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<WishlistItem user={self.user_id} product={self.product_id}>"
