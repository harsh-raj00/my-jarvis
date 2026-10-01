from typing import Generator
from sqlalchemy.orm import Session
from fastapi import Header, HTTPException, status
from src.config.database import SessionLocal
from src.config.settings import settings

def get_db() -> Generator[Session, None, None]:
    """
    Dependency function that yields db sessions
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def verify_api_key(x_api_key: str = Header(...)) -> None:
    """
    Dependency that enforces authentication via the X-API-Key header.
    """
    if not x_api_key or x_api_key != settings.secret_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )