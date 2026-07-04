from __future__ import annotations

import uuid

from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductResponse


class WishlistItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    product: ProductResponse


class WishlistResponse(BaseModel):
    items: list[WishlistItemResponse]
    item_count: int
