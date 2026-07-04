from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int = Field(description="Total number of items")
    page: int = Field(description="Current page number")
    pages: int = Field(description="Total number of pages")

    @classmethod
    def create(
        cls, items: list[T], total: int, pagination: PaginationParams
    ) -> "PaginatedResponse[T]":
        pages = max(1, -(-total // pagination.limit))  # ceil division
        return cls(
            items=items,
            total=total,
            page=pagination.page,
            pages=pages,
        )
