from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: str = Field(min_length=1, max_length=100)
    body: str = Field(min_length=1, max_length=1000)


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    product_id: uuid.UUID
    rating: int
    title: str
    body: str
    is_verified_purchase: bool
    reviewer_name: str
    created_at: datetime


class ReviewsResponse(BaseModel):
    items: list[ReviewResponse]
    avg_rating: float
    total: int
    distribution: dict[int, int]  # {5: 12, 4: 5, 3: 2, 2: 0, 1: 1}
