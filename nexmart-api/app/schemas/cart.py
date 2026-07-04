from __future__ import annotations

import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.product import ProductResponse


class AddToCartRequest(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(ge=1, default=1)


class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(ge=1)


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    product: ProductResponse


class CartSummaryResponse(BaseModel):
    items: list[CartItemResponse]
    item_count: int
    total_quantity: int
    subtotal: Decimal
