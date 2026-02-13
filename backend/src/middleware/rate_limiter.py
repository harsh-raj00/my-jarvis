from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
import time
from collections import defaultdict
from datetime import datetime


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    In-memory token-bucket rate limiter per client IP.

    - General API: rate_limit requests per minute
    - Chat endpoint: chat_rate_limit requests per minute (stricter)
    """

    def __init__(self, app, rate_limit: int = 60, chat_rate_limit: int = 20):
        super().__init__(app)
        self.rate_limit = rate_limit
        self.chat_rate_limit = chat_rate_limit
        # { ip: [ timestamp, timestamp, ... ] }
        self._requests: dict = defaultdict(list)

    def _clean_old_requests(self, ip: str, window: float = 60.0):
        """Remove request timestamps older than the window."""
        now = time.time()
        self._requests[ip] = [
            t for t in self._requests[ip] if now - t < window
        ]

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for WebSocket upgrades and health checks
        path = request.url.path
        if path.endswith("/ws") or path.endswith("/health"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        self._clean_old_requests(client_ip)

        # Determine limit based on path
        is_chat = "/chat" in path and request.method == "POST"
        limit = self.chat_rate_limit if is_chat else self.rate_limit

        if len(self._requests[client_ip]) >= limit:
            retry_after = 60 - (time.time() - self._requests[client_ip][0])
            return JSONResponse(
                status_code=429,
                content={
                    "error": True,
                    "status_code": 429,
                    "message": "Rate limit exceeded. Please slow down, Sir.",
                    "retry_after_seconds": round(max(retry_after, 1)),
                    "timestamp": datetime.now().isoformat(),
                },
                headers={"Retry-After": str(round(max(retry_after, 1)))},
            )

        self._requests[client_ip].append(time.time())
        return await call_next(request)
