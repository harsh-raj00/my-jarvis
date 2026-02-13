from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
import time
import uuid
import structlog

# ---------------------------------------------------------------------------
# Structlog configuration
# ---------------------------------------------------------------------------

def configure_logging(environment: str = "development"):
    """Configure structlog for pretty dev output or JSON production output."""
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
    ]

    if environment == "production":
        structlog.configure(
            processors=[
                *shared_processors,
                structlog.processors.JSONRenderer(),
            ],
            logger_factory=structlog.PrintLoggerFactory(),
            cache_logger_on_first_use=True,
        )
    else:
        structlog.configure(
            processors=[
                *shared_processors,
                structlog.dev.ConsoleRenderer(colors=True),
            ],
            logger_factory=structlog.PrintLoggerFactory(),
            cache_logger_on_first_use=True,
        )


logger = structlog.get_logger("jarvis")


# ---------------------------------------------------------------------------
# Request / Response logging middleware
# ---------------------------------------------------------------------------

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs every request with method, path, status code, and latency."""

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id

        start = time.perf_counter()

        # Log request
        logger.info(
            "request_started",
            request_id=request_id,
            method=request.method,
            path=str(request.url.path),
            client=request.client.host if request.client else "unknown",
        )

        response = await call_next(request)

        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)

        # Log response
        logger.info(
            "request_completed",
            request_id=request_id,
            method=request.method,
            path=str(request.url.path),
            status=response.status_code,
            latency_ms=elapsed_ms,
        )

        response.headers["X-Request-ID"] = request_id
        return response
