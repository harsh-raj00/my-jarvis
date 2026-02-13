from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds standard security headers to every response.
    Also enforces a maximum request body size.
    """

    def __init__(self, app, max_body_size_mb: float = 1.0):
        super().__init__(app)
        self.max_body_bytes = int(max_body_size_mb * 1024 * 1024)

    async def dispatch(self, request: Request, call_next):
        # --- Request size validation ---
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_body_bytes:
            return JSONResponse(
                status_code=413,
                content={
                    "error": True,
                    "status_code": 413,
                    "message": f"Request body too large. Maximum is {self.max_body_bytes // (1024*1024)} MB.",
                },
            )

        response = await call_next(request)

        # --- Security headers ---
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(self), geolocation=()"

        # HSTS only in production
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains; preload"
            )

        return response
