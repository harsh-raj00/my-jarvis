from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn

from src.config.settings import settings
from src.api.v1.router import api_router

# --- Middleware imports ---
from src.middleware.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
from src.middleware.logging_config import (
    RequestLoggingMiddleware,
    configure_logging,
)
from src.middleware.rate_limiter import RateLimiterMiddleware
from src.middleware.security import SecurityHeadersMiddleware

# --- Configure structured logging ---
configure_logging(settings.environment)

# --- App ---
app = FastAPI(
    title="J.A.R.V.I.S. AI Assistant",
    description="Enterprise-grade AI personal assistant",
    version="2.0.0",
)

# --- CORS middleware ---
cors_origins = [origin.strip() for origin in settings.allowed_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Custom middleware (order matters: outermost first) ---
app.add_middleware(SecurityHeadersMiddleware, max_body_size_mb=settings.max_request_size_mb)
app.add_middleware(
    RateLimiterMiddleware,
    rate_limit=settings.rate_limit_per_minute,
    chat_rate_limit=settings.chat_rate_limit_per_minute,
)
app.add_middleware(RequestLoggingMiddleware)

# --- Exception handlers ---
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# --- Include API routes ---
app.include_router(api_router, prefix="/api/v1")


# --- Root & health ---
@app.get("/")
def root():
    return {
        "message": "J.A.R.V.I.S. AI Assistant API",
        "status": "operational",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/api/v1/system/health",
        "websocket": "/api/v1/ws",
    }


@app.get("/api/v1/health")
def health_check_v1():
    return {"status": "healthy", "service": "jarvis-ai-v2"}


# --- Database initialization on startup ---
@app.on_event("startup")
async def startup():
    from src.config.database import init_db
    init_db()
    print("[OK] J.A.R.V.I.S. backend v2.0.0 online - all systems operational")


if __name__ == "__main__":
    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        reload=True,
    )