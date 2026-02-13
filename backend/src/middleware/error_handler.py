from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback
import uuid
from datetime import datetime


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions with structured JSON."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "message": exc.detail or "An error occurred",
            "request_id": getattr(request.state, "request_id", str(uuid.uuid4())),
            "timestamp": datetime.now().isoformat(),
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors with readable messages."""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error.get("loc", []))
        errors.append({"field": field, "message": error.get("msg", "")})

    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "status_code": 422,
            "message": "Request validation failed",
            "details": errors,
            "request_id": getattr(request.state, "request_id", str(uuid.uuid4())),
            "timestamp": datetime.now().isoformat(),
        },
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions — returns 500 with request ID."""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))

    # Log the full traceback server-side
    print(f"[ERROR] request_id={request_id}")
    traceback.print_exc()

    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "status_code": 500,
            "message": "Internal server error. J.A.R.V.I.S. encountered an unexpected issue.",
            "request_id": request_id,
            "timestamp": datetime.now().isoformat(),
        },
    )
