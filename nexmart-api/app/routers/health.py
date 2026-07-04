from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check():
    return {
        "status": "ok",
        "app": "NEXMART API",
        "version": "1.0.0",
    }


@router.get("/db")
async def health_db(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        return {
            "status": "ok",
            "database": "connected",
        }
    except Exception as e:
        return {
            "status": "error",
            "database": "disconnected",
            "detail": str(e),
        }
