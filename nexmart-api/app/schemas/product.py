import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from fastapi import Query
from pydantic import BaseModel, ConfigDict, Field


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str
    price: Decimal
    original_price: Decimal | None
    stock: int
    category: str
    brand: str | None
    rating: Decimal
    review_count: int
    images: list
    tags: list
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ProductCreate(BaseModel):
    name: str = Field(min_length=1)
    description: str
    price: Decimal = Field(gt=0)
    original_price: Decimal | None = None
    stock: int = Field(ge=0, default=0)
    category: str
    brand: str | None = None
    images: list[str] = []
    tags: list[str] = []


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    original_price: Decimal | None = None
    stock: int | None = None
    category: str | None = None
    brand: str | None = None
    images: list[str] | None = None
    tags: list[str] | None = None


class ProductFilters:
    def __init__(
        self,
        search: str | None = Query(default=None),
        category: str | None = Query(default=None),
        brand: str | None = Query(default=None),
        min_price: Decimal | None = Query(default=None),
        max_price: Decimal | None = Query(default=None),
        in_stock: bool | None = Query(default=None),
        sort_by: Literal["price_asc", "price_desc", "rating", "newest", "name"] | None = Query(default=None),
    ):
        self.search = search
        self.category = category
        self.brand = brand
        self.min_price = min_price
        self.max_price = max_price
        self.in_stock = in_stock
        self.sort_by = sort_by
