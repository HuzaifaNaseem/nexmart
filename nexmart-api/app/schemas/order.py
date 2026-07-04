from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ShippingAddress(BaseModel):
    """Stripe-style shipping address — matches the shape the frontend sends."""

    name: str = Field(min_length=1, max_length=200)
    address_line1: str = Field(min_length=1, max_length=200)
    address_line2: str | None = Field(default=None, max_length=200)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    postal_code: str = Field(min_length=1, max_length=20)
    country: str = Field(default="US", min_length=2, max_length=2)
    phone: str | None = Field(default=None, max_length=30)


class CheckoutRequest(BaseModel):
    shipping_address: ShippingAddress


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID | None
    quantity: int
    unit_price: Decimal
    product_name: str
    product_image: str | None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: str
    subtotal: Decimal
    shipping_fee: Decimal
    total: Decimal
    shipping_address: dict
    points_earned: int
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemResponse]


class UpdateOrderStatusRequest(BaseModel):
    status: Literal[
        "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"
    ]
