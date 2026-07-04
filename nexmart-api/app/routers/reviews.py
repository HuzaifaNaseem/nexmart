from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.product import Product
from app.models.review import Review
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewsResponse

router = APIRouter(tags=["reviews"])


def _to_response(review: Review) -> ReviewResponse:
    first = review.user.first_name or ""
    last = review.user.last_name or ""
    reviewer_name = f"{first} {last[0]}." if last else first
    return ReviewResponse(
        id=review.id,
        user_id=review.user_id,
        product_id=review.product_id,
        rating=review.rating,
        title=review.title,
        body=review.body,
        is_verified_purchase=review.is_verified_purchase,
        reviewer_name=reviewer_name,
        created_at=review.created_at,
    )


async def _refresh_product_rating(product_id: uuid.UUID, db: AsyncSession) -> None:
    result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.product_id == product_id)
    )
    avg, count = result.one()
    await db.execute(
        update(Product)
        .where(Product.id == product_id)
        .values(rating=round(float(avg or 0), 2), review_count=count or 0)
    )


@router.get("/products/{product_id}/reviews", response_model=ReviewsResponse)
async def get_reviews(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ReviewsResponse:
    result = await db.execute(
        select(Review)
        .where(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
    )
    reviews = list(result.scalars().all())

    dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in reviews:
        dist[r.rating] = dist.get(r.rating, 0) + 1

    avg = round(sum(r.rating for r in reviews) / len(reviews), 2) if reviews else 0.0

    return ReviewsResponse(
        items=[_to_response(r) for r in reviews],
        avg_rating=avg,
        total=len(reviews),
        distribution=dist,
    )


@router.post(
    "/products/{product_id}/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_review(
    product_id: uuid.UUID,
    body: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ReviewResponse:
    # Check product exists
    prod = await db.get(Product, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check no duplicate review
    existing = await db.execute(
        select(Review).where(
            Review.user_id == current_user.id,
            Review.product_id == product_id,
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="You have already reviewed this product")

    # Check if verified purchase
    from app.models.order import Order, OrderItem
    purchase = await db.execute(
        select(OrderItem)
        .join(Order, OrderItem.order_id == Order.id)
        .where(
            Order.user_id == current_user.id,
            OrderItem.product_id == product_id,
            Order.status.in_(["confirmed", "shipped", "delivered"]),
        )
    )
    is_verified = purchase.scalars().first() is not None

    review = Review(
        user_id=current_user.id,
        product_id=product_id,
        rating=body.rating,
        title=body.title,
        body=body.body,
        is_verified_purchase=is_verified,
    )
    db.add(review)
    await db.flush()
    await db.refresh(review)
    await _refresh_product_rating(product_id, db)
    await db.commit()
    await db.refresh(review)
    return _to_response(review)


@router.delete("/reviews/{review_id}", response_model=MessageResponse)
async def delete_review(
    review_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    product_id = review.product_id
    await db.delete(review)
    await db.flush()
    await _refresh_product_rating(product_id, db)
    await db.commit()
    return MessageResponse(message="Review deleted")
